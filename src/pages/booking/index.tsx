import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldErrors } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AddressAndDateStep } from '@/components/booking/AddressAndDateStep';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { ContactReviewStep } from '@/components/booking/ContactReviewStep';
import { PlanAndDetailsStep } from '@/components/booking/PlanAndDetailsStep';
import { BOOKING_STEP_LABELS, CUSTOM_BOOKING_STEP_LABELS, StepIndicator } from '@/components/booking/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/hooks/auth/use-auth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useCustomerProfile, useUpsertCustomerProfile } from '@/hooks/queries/use-profile';
import { usePlans } from '@/hooks/queries/use-plans';
import { useCreateQuote } from '@/hooks/queries/use-quotes';
import { calculateEstimatedPrice } from '@/lib/booking/estimate';
import {
	createPendingPhoto,
	MAX_PHOTOS,
	PhotoCompressionError,
	type PendingQuotePhoto,
} from '@/lib/booking/photo-compression';
import { uploadQuotePhotos } from '@/services/quote-photos';
import {
	bookingSchema,
	CONDITIONAL_BOOKING_FIELDS,
	CUSTOM_PLAN_TYPE,
	findFirstInvalidBookingStep,
	getBookingStepFields,
	getConditionalBookingIssues,
	TIME_PREFERENCE_HOURS,
	TOTAL_BOOKING_STEPS,
	type BookingValues,
} from '@/lib/validation/booking-schema';
import { cn } from '@/lib/utils';
import FloatingContactButtons from '@/components/FloatingContactButtons';

export default function BookingPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const planType = searchParams.get('plan');
	const rebookParams = {
		planId: searchParams.get('planId'),
		bedrooms: searchParams.get('bedrooms'),
		bathrooms: searchParams.get('bathrooms'),
		squareFootage: searchParams.get('squareFootage'),
		hasPets: searchParams.get('hasPets'),
		addressLine: searchParams.get('addressLine'),
		city: searchParams.get('city'),
		state: searchParams.get('state'),
		zipCode: searchParams.get('zipCode'),
		customerNote: searchParams.get('customerNote'),
	};
	const isRebooking = rebookParams.bedrooms != null;
	const hasRebookedAddress = rebookParams.addressLine != null;
	const { user } = useAuth();
	const { data: plans } = usePlans();
	const { data: profile } = useCustomerProfile(user?.id);
	const createQuote = useCreateQuote();
	const upsertProfile = useUpsertCustomerProfile();

	usePageMeta({
		title: 'Book a Cleaning | Alianci Cleaning',
		description: 'Request a quote and book your Austin home cleaning in minutes.',
		path: '/booking',
		noIndex: true,
	});

	const [step, setStep] = useState(() => (isRebooking ? 2 : 1));
	const [photos, setPhotos] = useState<PendingQuotePhoto[]>([]);
	const [isCompressing, setIsCompressing] = useState(false);
	const photosRef = useRef(photos);
	photosRef.current = photos;

	const defaultPlan = useMemo(
		() => plans?.find((plan) => plan.id === rebookParams.planId || plan.type === planType),
		[plans, planType, rebookParams.planId],
	);

	const form = useForm<BookingValues>({
		resolver: zodResolver(bookingSchema),
		defaultValues: {
			planId: defaultPlan?.id || '',
			isCustom: false,
			bedrooms: 1,
			bathrooms: 1,
			hasPets: false,
			addressLine: '',
			city: '',
			state: '',
			zipCode: '',
			timePreference: 'morning',
			fullName: '',
			email: '',
			phone: '',
		},
	});

	useEffect(() => {
		if (!profile) return;
		form.setValue('fullName', profile.full_name);
		if (profile.email) form.setValue('email', profile.email);
		if (profile.phone) form.setValue('phone', profile.phone);
		if (hasRebookedAddress) return;
		if (profile.address_line) form.setValue('addressLine', profile.address_line);
		if (profile.city) form.setValue('city', profile.city);
		if (profile.state) form.setValue('state', profile.state);
		if (profile.zip_code) form.setValue('zipCode', profile.zip_code);
	}, [profile, form, hasRebookedAddress]);

	useEffect(() => {
		if (rebookParams.customerNote) form.setValue('customer_note', rebookParams.customerNote);
		if (!hasRebookedAddress) return;
		if (rebookParams.bedrooms) form.setValue('bedrooms', Number(rebookParams.bedrooms));
		if (rebookParams.bathrooms) form.setValue('bathrooms', Number(rebookParams.bathrooms));
		if (rebookParams.squareFootage) form.setValue('squareFootage', Number(rebookParams.squareFootage));
		if (rebookParams.hasPets != null) form.setValue('hasPets', rebookParams.hasPets === 'true');
		if (rebookParams.addressLine) form.setValue('addressLine', rebookParams.addressLine);
		if (rebookParams.city) form.setValue('city', rebookParams.city);
		if (rebookParams.state) form.setValue('state', rebookParams.state);
		if (rebookParams.zipCode) form.setValue('zipCode', rebookParams.zipCode);
	}, []);

	useEffect(() => {
		if (user?.email && !profile) form.setValue('email', user.email);
	}, [user, profile, form]);

	useEffect(() => {
		if (defaultPlan) form.setValue('planId', defaultPlan.id);
	}, [defaultPlan, form]);

	const values = form.watch();
	const { errors } = form.formState;
	const selectedPlan = plans?.find((plan) => plan.id === values.planId);
	const isCustom = selectedPlan?.type === CUSTOM_PLAN_TYPE;

	useEffect(() => {
		form.setValue('isCustom', isCustom);
	}, [isCustom, form]);

	useEffect(() => {
		return () => {
			photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
		};
	}, []);

	useEffect(() => {
		const invalid = new Set(getConditionalBookingIssues(form.getValues()).map((issue) => issue.path));
		const resolved = CONDITIONAL_BOOKING_FIELDS.filter(
			(field) => !invalid.has(field) && errors[field]?.type === 'manual',
		);
		if (resolved.length) form.clearErrors(resolved);
	}, [errors, form, values.isCustom, values.customer_note, values.bedrooms, values.bathrooms, values.squareFootage]);

	const estimatedPrice = !selectedPlan
		? 0
		: isCustom
			? null
			: calculateEstimatedPrice(selectedPlan, {
					bedrooms: Number(values.bedrooms) || 0,
					bathrooms: Number(values.bathrooms) || 0,
					squareFootage: Number(values.squareFootage) || 0,
					hasPets: values.hasPets,
				});

	async function handleAddPhotos(files: File[]) {
		const remaining = MAX_PHOTOS - photos.length;
		if (remaining <= 0) return;

		const selected = files.slice(0, remaining);
		if (files.length > remaining) toast.info(`You can attach up to ${MAX_PHOTOS} photos.`);

		setIsCompressing(true);
		const results = await Promise.allSettled(selected.map(createPendingPhoto));
		setIsCompressing(false);

		const added: PendingQuotePhoto[] = [];
		for (const result of results) {
			if (result.status === 'fulfilled') {
				added.push(result.value);
				continue;
			}
			toast.error(
				result.reason instanceof PhotoCompressionError ? result.reason.message : 'Could not process one of the photos.',
			);
		}

		if (added.length) setPhotos((current) => [...current, ...added]);
	}

	function handleRemovePhoto(id: string) {
		const photo = photos.find((item) => item.id === id);
		if (photo) URL.revokeObjectURL(photo.previewUrl);
		setPhotos((current) => current.filter((item) => item.id !== id));
	}

	async function handleNext() {
		const fields = getBookingStepFields(step, isCustom);
		const valid = await form.trigger(fields);

		const issues = getConditionalBookingIssues(form.getValues()).filter((issue) =>
			(fields as string[]).includes(issue.path),
		);
		for (const issue of issues) {
			form.setError(issue.path, { type: 'manual', message: issue.message });
		}

		if (valid && !issues.length) setStep((current) => current + 1);
	}

	function handleInvalid(errors: FieldErrors<BookingValues>) {
		const targetStep = findFirstInvalidBookingStep(Object.keys(errors), isCustom);
		if (targetStep == null || targetStep === step) return;
		setStep(targetStep);
		toast.error('Please review the highlighted field before submitting.');
	}

	function handleBack() {
		setStep((current) => current - 1);
	}

	async function onSubmit(data: BookingValues) {
		if (!selectedPlan || !user) return;

		const desiredVisitDate = new Date(data.desiredDate);
		desiredVisitDate.setHours(TIME_PREFERENCE_HOURS[data.timePreference], 0, 0, 0);

		const savedProfile = await upsertProfile.mutateAsync({
			user_id: user.id,
			full_name: data.fullName,
			email: data.email,
			phone: data.phone,
			address_line: data.addressLine,
			city: data.city || null,
			state: data.state || null,
			zip_code: data.zipCode || null,
		});

		const quote = await createQuote.mutateAsync({
			customer_id: savedProfile.id,
			customer_name: data.fullName,
			customer_email: data.email,
			customer_phone: data.phone,
			address_line: data.addressLine,
			city: data.city || null,
			state: data.state || null,
			zip_code: data.zipCode || null,
			bedrooms: isCustom ? null : (data.bedrooms ?? null),
			bathrooms: isCustom ? null : (data.bathrooms ?? null),
			square_footage: isCustom ? null : (data.squareFootage ?? null),
			has_pets: isCustom ? false : data.hasPets,
			plan_id: selectedPlan.id,
			desired_visit_date: desiredVisitDate.toISOString(),
			estimated_price: estimatedPrice,
			customer_note: data.customer_note?.trim() || null,
		});

		if (photos.length) {
			try {
				await uploadQuotePhotos(quote.id, photos);
			} catch {
				toast.error('Your request was sent, but we could not attach the photos. We will follow up by phone.');
			}
		}

		navigate('/my-quotes');
	}

	return (
		<div className="relative">
			<FloatingContactButtons />
			<Link
				to="/"
				className={cn(
					'absolute left-4 top-4 md:left-6 md:top-6 flex items-center justify-center rounded-full bg-muted p-1 md:p-2 transition-colors hover:bg-muted/80',
				)}
			>
				<img
					src="/favicon/web-app-manifest-512x512.png"
					alt="Alianci Cleaning"
					className="rounded-full object-cover h-10 w-10 md:h-24 md:w-24"
				/>
			</Link>
			<div className="flex min-h-dvh items-center justify-center px-6 py-12">
				<div className="w-full max-w-xl">
					<h1 className="mb-6 text-center text-2xl font-bold text-foreground">Request a Quote</h1>

					<Card>
						<CardContent className="flex flex-col gap-6">
							<StepIndicator currentStep={step} labels={isCustom ? CUSTOM_BOOKING_STEP_LABELS : BOOKING_STEP_LABELS} />

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit, handleInvalid)}
									className="flex flex-col gap-6"
									onKeyDown={(event) => {
										if (event.key === 'Enter' && step < TOTAL_BOOKING_STEPS) event.preventDefault();
									}}
								>
									{step === 1 && (
										<PlanAndDetailsStep
											form={form}
											plans={plans ?? []}
											isCustom={isCustom}
											photos={photos}
											isCompressing={isCompressing}
											onAddFiles={handleAddPhotos}
											onRemovePhoto={handleRemovePhoto}
										/>
									)}
									{step === 2 && <AddressAndDateStep form={form} />}
									{step === 3 && (
										<ContactReviewStep
											form={form}
											plan={selectedPlan}
											estimatedPrice={estimatedPrice}
											isCustom={isCustom}
											photoCount={photos.length}
										/>
									)}

									<BookingSummary planName={selectedPlan?.name} estimatedPrice={estimatedPrice} />

									<div className="flex items-center justify-between gap-3">
										{step > 1 ? (
											<Button type="button" variant="ghost" onClick={handleBack}>
												Back
											</Button>
										) : (
											<span />
										)}

										{step < TOTAL_BOOKING_STEPS ? (
											<Button
												key="continue"
												type="button"
												variant="gradient"
												onClick={handleNext}
												disabled={isCompressing}
											>
												Continue
											</Button>
										) : (
											<Button key="submit" type="submit" variant="gradient" disabled={form.formState.isSubmitting}>
												{form.formState.isSubmitting ? 'Submitting...' : 'Submit request'}
											</Button>
										)}
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
