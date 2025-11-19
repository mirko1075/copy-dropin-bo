import { ServiceProduct, ProductStatus } from './service-product.model';
import { ServiceCategory, CategoryStatus } from './service-category.model';
import { PaymentConfig, CreditCardType } from './payment-config.model';

export const MOCK_PRODUCTS: ServiceProduct[] = [
  {
    id: 101,
    name: 'Massaggio Rilassante',
    category: 'Wellness & SPA',
    categoryId: 1,
    status: ProductStatus.Pubblicato,
    imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    price: 80.00,
    currency: 'EUR',
    duration: 60,
    translations: {
      it: {
        name: 'Massaggio Rilassante',
        shortDescription: 'Un massaggio completo di 60 minuti',
        longDescription: 'Massaggio rilassante di 60 minuti che utilizza oli essenziali naturali...'
      },
      en: {
        name: 'Relaxing Massage',
        shortDescription: 'A complete 60-minute massage',
        longDescription: '60-minute relaxing massage using natural essential oils...'
      }
    }
  },
  {
    id: 201,
    name: 'Cena Romantica',
    category: 'Ristorante',
    categoryId: 2,
    status: ProductStatus.Pubblicato,
    price: 120.00,
    currency: 'EUR',
    numberOfPeople: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    duration: 180,
    translations: {
      it: {
        name: 'Cena Romantica',
        shortDescription: 'Menu degustazione per due persone',
        longDescription: 'Una serata indimenticabile con menu degustazione di 5 portate...'
      },
      en: {
        name: 'Romantic Dinner',
        shortDescription: 'Tasting menu for two people',
        longDescription: 'An unforgettable evening with a 5-course tasting menu...'
      }
    }
  }
];

export const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 1,
    name: 'Wellness & SPA',
    status: CategoryStatus.Attivo,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    translations: {
      it: { name: 'Benessere & SPA' },
      en: { name: 'Wellness & SPA' },
      de: { name: 'Wellness & SPA' },
      fr: { name: 'Bien-être & SPA' },
      es: { name: 'Bienestar & SPA' }
    }
  },
  {
    id: 2,
    name: 'Ristorante',
    status: CategoryStatus.Attivo,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    translations: {
      it: { name: 'Ristorante' },
      en: { name: 'Restaurant' },
      de: { name: 'Restaurant' },
      fr: { name: 'Restaurant' },
      es: { name: 'Restaurante' }
    }
  }
];

export const MOCK_PAYMENT_CONFIG: PaymentConfig = {
  tenantId: 1,
  vendorId: 1,
  siteId: 1,
  paymentMethods: {
    creditCard: {
      enabled: true,
      types: [
        CreditCardType.Visa,
        CreditCardType.Mastercard,
        CreditCardType.Amex
      ],
      requiresCvv: true,
      gatewayProvider: 'stripe',
      isGuarantee: false
    },
    bankTransfer: {
      enabled: true,
      minDaysBeforeArrival: 7,
      ibanRequired: true,
      accountDetails: {
        bankName: 'Banca Intesa',
        iban: 'IT60X0542811101000000123456',
        swift: 'BCITITMM',
        accountHolder: 'Hotel Management SRL'
      }
    },
    paypal: {
      enabled: true,
      clientId: 'AeA1QIZXbfe...',
      environment: 'production'
    },
    scalapay: {
      enabled: true,
      numInstallments: 3,
      minAmount: 50,
      maxAmount: 1500
    }
  },
  paymentOptions: {
    allowFullPayment: true,
    allowDeposit: true,
    allowInstallments: false,
    depositPercentage: 30
  }
};

export const SUPPORTED_LOCALES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];
