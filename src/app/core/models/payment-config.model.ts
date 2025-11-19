export interface PaymentConfig {
  id?: number;
  tenantId: number;
  vendorId: number;
  siteId: number;
  paymentMethods: PaymentMethodsConfig;
  paymentOptions: PaymentOptionsConfig;
}

export interface PaymentMethodsConfig {
  creditCard: CreditCardConfig;
  bankTransfer: BankTransferConfig;
  paypal: PayPalConfig;
  scalapay: ScalapayConfig;
}

export interface CreditCardConfig {
  enabled: boolean;
  types: CreditCardType[];        // Multiple card types
  requiresCvv: boolean;
  gatewayProvider: PaymentGatewayProvider;
  isGuarantee: boolean;
}

export enum CreditCardType {
  Visa = 1,
  Mastercard = 2,
  Amex = 4,
  Discover = 8,
  DinersClub = 16,
  JCB = 32
}

export type PaymentGatewayProvider =
  | 'stripe'
  | 'braintree'
  | 'paypal'
  | 'nexi'
  | 'gestpay'
  | 'custom';

export interface BankTransferConfig {
  enabled: boolean;
  minDaysBeforeArrival: number;
  ibanRequired: boolean;
  accountDetails?: {
    bankName: string;
    iban: string;
    swift: string;
    accountHolder: string;
    additionalInfo?: string;
  };
}

export interface PayPalConfig {
  enabled: boolean;
  clientId?: string;
  environment: 'sandbox' | 'production';
}

export interface ScalapayConfig {
  enabled: boolean;
  numInstallments: number;       // Es: 3 rate
  minAmount: number;
  maxAmount?: number;
}

export interface PaymentOptionsConfig {
  allowFullPayment: boolean;
  allowDeposit: boolean;
  allowInstallments: boolean;
  depositPercentage?: number;    // Es: 30 (%)
  depositFixedAmount?: number;   // Es: 50.00 (EUR)
}
