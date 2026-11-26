import { type components } from '@/api/schema';

export type Feature = NonNullable<components['schemas']['FeatureFlagDto']['feature']>;
