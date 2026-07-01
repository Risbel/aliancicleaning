export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '14.5';
	};
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					extensions?: Json;
					operationName?: string;
					query?: string;
					variables?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			cleaning_plans: {
				Row: {
					base_price: number;
					created_at: string;
					description: string | null;
					id: string;
					is_active: boolean;
					name: string;
					pet_fee: number;
					price_per_bathroom: number;
					price_per_bedroom: number;
					price_per_sqft: number;
					type: Database['public']['Enums']['cleaning_type'];
					updated_at: string;
				};
				Insert: {
					base_price?: number;
					created_at?: string;
					description?: string | null;
					id?: string;
					is_active?: boolean;
					name: string;
					pet_fee?: number;
					price_per_bathroom?: number;
					price_per_bedroom?: number;
					price_per_sqft?: number;
					type: Database['public']['Enums']['cleaning_type'];
					updated_at?: string;
				};
				Update: {
					base_price?: number;
					created_at?: string;
					description?: string | null;
					id?: string;
					is_active?: boolean;
					name?: string;
					pet_fee?: number;
					price_per_bathroom?: number;
					price_per_bedroom?: number;
					price_per_sqft?: number;
					type?: Database['public']['Enums']['cleaning_type'];
					updated_at?: string;
				};
				Relationships: [];
			};
			customer_profiles: {
				Row: {
					address_line: string | null;
					city: string | null;
					created_at: string;
					email: string;
					full_name: string;
					id: string;
					phone: string | null;
					state: string | null;
					updated_at: string;
					zip_code: string | null;
				};
				Insert: {
					address_line?: string | null;
					city?: string | null;
					created_at?: string;
					email: string;
					full_name: string;
					id: string;
					phone?: string | null;
					state?: string | null;
					updated_at?: string;
					zip_code?: string | null;
				};
				Update: {
					address_line?: string | null;
					city?: string | null;
					created_at?: string;
					email?: string;
					full_name?: string;
					id?: string;
					phone?: string | null;
					state?: string | null;
					updated_at?: string;
					zip_code?: string | null;
				};
				Relationships: [];
			};
			quotes: {
				Row: {
					address_line: string;
					admin_notes: string | null;
					assigned_to: string | null;
					bathrooms: number;
					bedrooms: number;
					city: string | null;
					created_at: string;
					customer_email: string;
					customer_id: string | null;
					customer_name: string;
					customer_note: string | null;
					customer_phone: string;
					desired_visit_date: string;
					estimated_price: number | null;
					final_price: number | null;
					has_pets: boolean;
					id: string;
					plan_id: string;
					square_footage: number;
					state: string | null;
					status: Database['public']['Enums']['quote_status'];
					updated_at: string;
					zip_code: string | null;
				};
				Insert: {
					address_line: string;
					admin_notes?: string | null;
					assigned_to?: string | null;
					bathrooms: number;
					bedrooms: number;
					city?: string | null;
					created_at?: string;
					customer_email: string;
					customer_id?: string | null;
					customer_name: string;
					customer_note?: string | null;
					customer_phone: string;
					desired_visit_date: string;
					estimated_price?: number | null;
					final_price?: number | null;
					has_pets?: boolean;
					id?: string;
					plan_id: string;
					square_footage: number;
					state?: string | null;
					status?: Database['public']['Enums']['quote_status'];
					updated_at?: string;
					zip_code?: string | null;
				};
				Update: {
					address_line?: string;
					admin_notes?: string | null;
					assigned_to?: string | null;
					bathrooms?: number;
					bedrooms?: number;
					city?: string | null;
					created_at?: string;
					customer_email?: string;
					customer_id?: string | null;
					customer_name?: string;
					customer_note?: string | null;
					customer_phone?: string;
					desired_visit_date?: string;
					estimated_price?: number | null;
					final_price?: number | null;
					has_pets?: boolean;
					id?: string;
					plan_id?: string;
					square_footage?: number;
					state?: string | null;
					status?: Database['public']['Enums']['quote_status'];
					updated_at?: string;
					zip_code?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'quotes_assigned_to_fkey';
						columns: ['assigned_to'];
						isOneToOne: false;
						referencedRelation: 'staff_profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'quotes_customer_id_fkey';
						columns: ['customer_id'];
						isOneToOne: false;
						referencedRelation: 'customer_profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'quotes_plan_id_fkey';
						columns: ['plan_id'];
						isOneToOne: false;
						referencedRelation: 'cleaning_plans';
						referencedColumns: ['id'];
					},
				];
			};
			staff_profiles: {
				Row: {
					created_at: string;
					full_name: string;
					id: string;
					role: Database['public']['Enums']['staff_role'];
				};
				Insert: {
					created_at?: string;
					full_name: string;
					id: string;
					role?: Database['public']['Enums']['staff_role'];
				};
				Update: {
					created_at?: string;
					full_name?: string;
					id?: string;
					role?: Database['public']['Enums']['staff_role'];
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			is_staff: { Args: never; Returns: boolean };
		};
		Enums: {
			cleaning_type: 'standard' | 'deep' | 'move_in_out';
			quote_status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'declined' | 'completed' | 'cancelled';
			staff_role: 'admin' | 'manager' | 'staff';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {
			cleaning_type: ['standard', 'deep', 'move_in_out'],
			quote_status: ['pending', 'reviewed', 'quoted', 'accepted', 'declined', 'completed', 'cancelled'],
			staff_role: ['admin', 'manager', 'staff'],
		},
	},
} as const;
