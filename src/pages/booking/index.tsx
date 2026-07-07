import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { AddressAndDateStep } from '@/components/booking/AddressAndDateStep';
import { BookingSuccess } from '@/components/booking/BookingSuccess';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { ContactReviewStep } from '@/components/booking/ContactReviewStep';
import { PlanAndDetailsStep } from '@/components/booking/PlanAndDetailsStep';
import { StepIndicator } from '@/components/booking/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/hooks/auth/use-auth';
import { useCustomerProfile, useUpsertCustomerProfile } from '@/hooks/queries/use-profile';
import { usePlans } from '@/hooks/queries/use-plans';
import { useCreateQuote } from '@/hooks/queries/use-quotes';
import { calculateEstimatedPrice } from '@/lib/booking/estimate';
import {
	bookingSchema,
	bookingStepFields,
	TIME_PREFERENCE_HOURS,
	TOTAL_BOOKING_STEPS,
	type BookingValues,
} from '@/lib/validation/booking-schema';
import { cn } from '@/lib/utils';
import FloatingContactButtons from '@/components/FloatingContactButtons';

export default function BookingPage() {
	const [searchParams] = useSearchParams();
	const planType = searchParams.get('plan');
	const { user } = useAuth();
	const { data: plans } = usePlans();
	const { data: profile } = useCustomerProfile(user?.id);
	const createQuote = useCreateQuote();
	const upsertProfile = useUpsertCustomerProfile();

	const [step, setStep] = useState(1);
	const [submitted, setSubmitted] = useState(false);

	const defaultPlan = useMemo(() => plans?.find((plan) => plan.type === planType), [plans, planType]);

	const form = useForm<BookingValues>({
		resolver: zodResolver(bookingSchema),
		defaultValues: {
			planId: defaultPlan?.id || '',
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
		form.setValue('email', profile.email);
		if (profile.phone) form.setValue('phone', profile.phone);
		if (profile.address_line) form.setValue('addressLine', profile.address_line);
		if (profile.city) form.setValue('city', profile.city);
		if (profile.state) form.setValue('state', profile.state);
		if (profile.zip_code) form.setValue('zipCode', profile.zip_code);
	}, [profile, form]);

	useEffect(() => {
		if (user?.email && !profile) form.setValue('email', user.email);
	}, [user, profile, form]);

	useEffect(() => {
		if (defaultPlan) form.setValue('planId', defaultPlan.id);
	}, [defaultPlan, form]);

	const values = form.watch();
	const selectedPlan = plans?.find((plan) => plan.id === values.planId);
	const estimatedPrice = selectedPlan
		? calculateEstimatedPrice(selectedPlan, {
				bedrooms: Number(values.bedrooms) || 0,
				bathrooms: Number(values.bathrooms) || 0,
				squareFootage: Number(values.squareFootage) || 0,
				hasPets: values.hasPets,
			})
		: 0;

	async function handleNext() {
		const fields = bookingStepFields[step as keyof typeof bookingStepFields];
		const valid = await form.trigger(fields);
		if (valid) setStep((current) => current + 1);
	}

	function handleBack() {
		setStep((current) => current - 1);
	}

	async function onSubmit(data: BookingValues) {
		if (!selectedPlan || !user) return;

		const desiredVisitDate = new Date(data.desiredDate);
		desiredVisitDate.setHours(TIME_PREFERENCE_HOURS[data.timePreference], 0, 0, 0);

		await upsertProfile.mutateAsync({
			id: user.id,
			full_name: data.fullName,
			email: data.email,
			phone: data.phone,
			address_line: data.addressLine,
			city: data.city || null,
			state: data.state || null,
			zip_code: data.zipCode || null,
		});

		await createQuote.mutateAsync({
			customer_id: user.id,
			customer_name: data.fullName,
			customer_email: data.email,
			customer_phone: data.phone,
			address_line: data.addressLine,
			city: data.city || null,
			state: data.state || null,
			zip_code: data.zipCode || null,
			bedrooms: data.bedrooms,
			bathrooms: data.bathrooms,
			square_footage: data.squareFootage,
			has_pets: data.hasPets,
			plan_id: selectedPlan.id,
			desired_visit_date: desiredVisitDate.toISOString(),
			estimated_price: estimatedPrice,
		});

		setSubmitted(true);
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
							{submitted ? (
								<BookingSuccess />
							) : (
								<>
									<StepIndicator currentStep={step} />

									<Form {...form}>
										<form
											onSubmit={form.handleSubmit(onSubmit)}
											className="flex flex-col gap-6"
											onKeyDown={(event) => {
												if (event.key === 'Enter' && step < TOTAL_BOOKING_STEPS) event.preventDefault();
											}}
										>
											{step === 1 && <PlanAndDetailsStep form={form} plans={plans ?? []} />}
											{step === 2 && <AddressAndDateStep form={form} />}
											{step === 3 && (
												<ContactReviewStep form={form} plan={selectedPlan} estimatedPrice={estimatedPrice} />
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
													<Button key="continue" type="button" variant="gradient" onClick={handleNext}>
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
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
