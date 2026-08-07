"use client";

import React, { createContext, useContext, type CSSProperties } from "react";
import {
  FashionFontLoader,
  FashionHeroSlider,
  FashionPromoBanners,
  FashionSectionTitle,
  FashionProductGrid,
  FashionCategoryCards,
  FashionTestimonials,
  FashionBlogPosts,
  FashionNewsletter,
  FashionFooter,
  FashionFeatures,
  FashionInstagram,
  FashionMarquee,
  FashionCoverBanners,
  FashionAboutContent,
  FashionStatsCounters,
  FashionServicesGrid,
  FashionGalleryGrid,
  FashionVideoSection,
  FashionQuoteSection,
  FashionTeamSection,
  FashionOfficeLocations,
  FashionStoreVisit,
  FashionFaqAccordion,
  FashionContactForm,
} from "@/components/storefront/FashionTemplateBlocks";
import { resolveSectionStyleOverrides } from "@/components/storefront/block-style";
import { normalizeStorefrontTemplateProps } from "@/components/storefront/prop-normalizers";
import { TShirtsPrintsHeader, TShirtsPrintsFooter } from "@/components/storefront/TShirtsPrintsStoreChrome";
import {
  TShirtAboutHero,
  TShirtFeatureCards,
  TShirtImageCallout,
  TShirtContactFormSection,
  TShirtContactInfo,
  TShirtContactHero,
  TShirtBlogPosts,
} from "@/components/storefront/TShirtsPrintsTemplateBlocks";
import type {
  FashionHeroSliderProps,
  FashionPromoBannersProps,
  FashionSectionTitleProps,
  FashionProductGridProps,
  FashionCategoryCardsProps,
  FashionTestimonialsProps,
  FashionBlogPostsProps,
  FashionNewsletterProps,
  FashionFooterProps,
  FashionFeaturesProps,
  FashionInstagramProps,
  FashionMarqueeProps,
  FashionCoverBannersProps,
} from "@/components/storefront/FashionTemplateBlocks";
import {
  ElectronicsFontLoader,
  ElectronicsHeroSlider,
  ElectronicsPromoBanners,
  ElectronicsProductTabs,
  ElectronicsBannerGrid,
  ElectronicsHotDeals,
  ElectronicsSideBanner,
  ElectronicsGamingCTA,
  ElectronicsBlogPosts,
  ElectronicsPartners,
  ElectronicsFooter,
  ElectronicsSectionTitle,
  ElectronicsAboutContent,
  ElectronicsStatsCounters,
  ElectronicsServicesGrid,
  ElectronicsGalleryGrid,
  ElectronicsVideoSection,
  ElectronicsQuoteSection,
  ElectronicsTeamSection,
  ElectronicsOfficeLocations,
  ElectronicsStoreVisit,
  ElectronicsFaqAccordion,
  ElectronicsContactForm,
} from "@/components/storefront/ElectronicsTemplateBlocks";
import {
  HardwareSectionTitle,
  HardwareAboutContent,
  HardwareStatsCounters,
  HardwareServicesGrid,
  HardwareGalleryGrid,
  HardwareVideoSection,
  HardwareQuoteSection,
  HardwareTeamSection,
  HardwareOfficeLocations,
  HardwareCoverBanners,
  HardwareStoreVisit,
  HardwareFaqAccordion,
  HardwareContactForm,
  HardwareBlogPosts,
} from "@/components/storefront/HardwareTemplateBlocks";
import {
  HardwareHomeHeroSlider,
  HardwareHomeCategoryGrid,
  HardwareHomeFeaturedProducts,
  HardwareHomeBuildPC,
  HardwareHomePricingTable,
  HardwareHomeGearUpCTA,
  HardwareHomeCustomDesktops,
  HardwareHomeGamingGallery,
  HardwareHomeTestimonial,
  HardwareHomeLatestEvents,
  HardwareHomeNewsletter,
  HardwareHomeFooter,
} from "@/components/storefront/HardwareHomepageBlocks";
import {
  BakeryFontLoader,
  BakeryHeroSlider,
  BakerySectionTitle,
  BakeryCategoryInfoBoxes,
  BakeryHandmade,
  BakeryProductGrid,
  BakeryProcess,
  BakeryBlogPosts,
  BakeryCta,
  BakeryFooter,
  BakeryAboutContent,
  BakeryStatsCounters,
  BakeryServicesGrid,
  BakeryGalleryGrid,
  BakeryVideoSection,
  BakeryQuoteSection,
  BakeryTeamSection,
  BakeryOfficeLocations,
  BakeryCoverBanners,
  BakeryStoreVisit,
  BakeryFaqAccordion,
  BakeryContactForm,
} from "@/components/storefront/BakeryTemplateBlocks";
import {
  ToolsGridBanners,
  ToolsFeatureIcons,
  ToolsSectionTitle,
  ToolsProductGrid,
  ToolsFeatureSection,
  ToolsDeliveryBanner,
  ToolsPreFooter,
} from "@/components/storefront/ToolsTemplateBlocks";
import {
  CosmeticsFontLoader,
  CosmeticsHeroSlider,
  CosmeticsPromoBanners,
  CosmeticsSectionTitle,
  CosmeticsProductGrid,
  CosmeticsCategoryCards,
  CosmeticsDiscovery,
  CosmeticsCountdownBanner,
  CosmeticsInfoBoxes,
  CosmeticsBlogPosts,
  CosmeticsInstagram,
  CosmeticsNewsletter,
  // CosmeticsFooter - handled at page level, not as block
} from "@/components/storefront/CosmeticsTemplateBlocks";
import {
  GroceryFontLoader,
  GroceryHeroSlider,
  GroceryFeaturesBar,
  GrocerySectionTitle,
  GroceryProductGrid,
  GroceryPromoBanners,
  GroceryCategoryGrid,
  GroceryNewsletter,
  GroceryBestSellers,
  GroceryFooter,
  GroceryAboutHero,
  GroceryTextSection,
  GroceryTeamSection,
  GroceryFaqSection,
  GroceryContactHero,
  GroceryContactForm,
  GroceryBlogGrid,
} from "@/components/storefront/GroceryTemplateBlocks";
import {
  HealthFontLoader,
  HealthHero,
  HealthMarquee,
  HealthPromoBanners,
  HealthSectionTitle,
  HealthCategoryCards,
  HealthProductGrid,
  HealthVideoSection,
  HealthFeatureSection,
  HealthTestimonials,
  HealthBlogPosts,
  HealthNewsletter,
  HealthBrandMarquee,
  HealthFooter,
  HealthFooterFull,
  HealthHeader,
  HealthAboutPage,
  HealthContactPage,
  HealthBlogPage,
  HealthIngredientsPage,
  HealthMedicalExpertsPage,
} from "@/components/storefront/HealthTemplateBlocks";
import {
  InteriorFontLoader,
  InteriorHeroSlider,
  InteriorSectionTitle,
  InteriorCategoryGrid,
  InteriorProductGrid,
  InteriorInfoBoxes,
  InteriorGardenProducts,
  InteriorPromoBanners,
  InteriorFurnitureCategories,
  InteriorFurnitureProducts,
  InteriorBlogPosts,
  InteriorBrandsBar,
  InteriorCta,
  InteriorFooter,
  InteriorAboutContent,
  InteriorStatsCounters,
  InteriorServicesGrid,
  InteriorGalleryGrid,
  InteriorVideoSection,
  InteriorQuoteSection,
  InteriorTeamSection,
  InteriorOfficeLocations,
  InteriorStoreVisit,
  InteriorFaqAccordion,
  InteriorContactForm,
  GardenHeroBanner,
  GardenCategoryBanner,
  GardenDiscountBanner,
  GardenNewArrivals,
  GardenFeatures,
  GardenTestimonials,
  GardenAboutPage,
  GardenContactPage,
  GardenProductCategory,
} from "@/components/storefront/InteriorDesignTemplateBlocks";
import {
  AccessoriesAboutHero,
  AccessoriesTeamSection,
  AccessoriesStrategySection,
  AccessoriesCommunityCta,
  AccessoriesStoreVisit,
  AccessoriesFaqAccordion,
  AccessoriesContactForm,
  AccessoriesBlogHeader,
  AccessoriesBlogPosts,
  AccessoriesProductGrid,
  AccessoriesFaqsHeader,
  AccessoriesFaqsContactInfo,
  AccessoriesCategorizedFaq,
} from "@/components/storefront/AccessoriesTemplateBlocks";
import {
  KidsFontLoader,
  KidsAnnouncementBar,
  KidsHeroSlider,
  KidsSectionTitle,
  KidsCategoryCards,
  KidsProductGrid,
  KidsBundlePromo,
  KidsBlogPosts,
  KidsInstagram,
  KidsNewsletter,
  KidsFooter,
  KidsFooterFull,
  KidsHeader,
  KidsAboutHero,
  KidsTeamSection,
  KidsTextSection,
  KidsFaqSection,
  KidsContactHero,
  KidsContactInfo,
  KidsContactForm,
  KidsOpeningHours,
} from "@/components/storefront/KidsTemplateBlocks";
import {
  ToysFontLoader,
  ToysHeroSlider,
  ToysBannerCards,
  ToysVideoWelcome,
  ToysFeaturesBar,
  ToysAgeCategories,
  ToysSectionTitle,
  ToysProductGrid,
  ToysLimitedOffer,
  ToysTestimonials,
  ToysNewsletter,
  ToysFooter,
} from "@/components/storefront/ToysTemplateBlocks";
import {
  LandingGadgetFontLoader,
  LandingGadgetHero,
  LandingGadgetStatsBar,
  LandingGadgetFeatureSplit,
  LandingGadgetDarkFeature,
  LandingGadgetPhotoGallery,
  LandingGadgetCameraDark,
  LandingGadgetSecurity,
  LandingGadgetCameraOptics,
  LandingGadgetProductsShowcase,
  LandingGadgetNewsletter,
  LandingGadgetFooter,
  LandingGadgetFullWidthImage,
} from "@/components/storefront/LandingGadgetBlocks";
import {
  AegisLandingFontLoader,
  AegisHeader,
  AegisHero,
  AegisServices,
  AegisStories,
  AegisCTA,
  AegisFooter,
} from "@/components/storefront/AegisLandingBlocks";
import {
  ProkipAgentFontLoader,
  ProkipAgentModal,
  ProkipAgentTopBanner,
  ProkipAgentHero,
  ProkipAgentIntro,
  ProkipAgentAbout,
  ProkipAgentBenefits,
  ProkipAgentMedia,
  ProkipAgentSupport,
  ProkipAgentConversion,
  ProkipAgentFooter,
} from "@/components/storefront/ProkipAgentLandingBlocks";
import {
  ProkipBookingFontLoader,
  ProkipBookingHero,
  ProkipBookingProblemSection,
  ProkipBookingSolution,
  ProkipBookingDemoDetails,
  ProkipBookingTestimonials,
  ProkipBookingProcess,
  ProkipBookingForm,
  ProkipBookingFooter,
} from "@/components/storefront/ProkipBookingLandingBlocks";
import {
  MakeupFontLoader,
  MakeupHeroSlider,
  MakeupCategorySidebar,
  MakeupSectionTitle,
  MakeupProductGrid,
  MakeupProductTypeCards,
  MakeupBeforeAfter,
  MakeupPromoBannerCards,
  MakeupVideoBlog,
  MakeupBlogPosts,
  MakeupBrandsCarousel,
  MakeupFooter,
  MakeupAboutHero,
  MakeupTextSection,
  MakeupTeamSection,
  MakeupFaqSection,
  MakeupContactHero,
  MakeupContactForm,
  MakeupBlogGrid,
} from "@/components/storefront/MakeupTemplateBlocks";
import {
  PerfumesFontLoader,
  PerfumesHeroSlider,
  PerfumesSectionTitle,
  PerfumesProductGrid,
  PerfumesOlfactoryTags,
  PerfumesMarquee,
  PerfumesFeaturedBanners,
  PerfumesTabbedProducts,
  PerfumesCollectionBanners,
  PerfumesBlogArticles,
  PerfumesInstagram,
  PerfumesFooter,
  PerfumesAboutWelcome,
  PerfumesAboutMarquee,
  PerfumesAboutStory,
  PerfumesWhyChooseUs,
  PerfumesContactHero,
  PerfumesContactInfo,
  PerfumesContactForm,
  PerfumesBrandedStores,
  PerfumesPageHero,
  PerfumesCollectionsGrid,
  PerfumesJournalGrid,
  PerfumesReviewsHero,
  PerfumesReviewsGrid,
  PerfumesFeaturedProducts,
  PerfumesFeaturedPosts,
} from "@/components/storefront/PerfumesTemplateBlocks";
import {
  VegetableHero,
  VegetableFeatures,
  VegetableMenu,
  VegetableMenuSections,
  VegetableRecipeGrid,
  VegetableAboutHero,
  VegetableTeam,
  VegetableContact,
  VegetableReservation,
} from "@/components/storefront/VegetableTemplateBlocks";
import {
  AiFontLoader,
  AiAnnouncementBar,
  AiHeroVideo,
  AiCategoryRow,
  AiLargeProductCarousel,
  AiPromoTiles,
  AiProductCarousel,
  AiValueProps,
  AiNewsletter,
  AiFooter,
  AiSectionTitle,
} from "@/components/storefront/AiTemplateBlocks";
import {
  JumiaFontLoader,
  JumiaTopBar,
  JumiaHeader,
  JumiaHeroBanner,
  JumiaFlashDeals,
  JumiaCategoryGrid,
  JumiaSectionTitle,
  JumiaProductGrid,
  JumiaPromoBanners,
  JumiaOfficialStores,
  JumiaFeaturesBar,
  JumiaAppBanner,
  JumiaNewsletter,
  JumiaFooter,
  JumiaTopDeals,
  JumiaSponsored,
  JumiaCategoryDealRow,
  JumiaBrandStoreRow,
  JumiaCategoryIconBar,
  JumiaPromoTiles,
  JumiaBottomNav,
  JumiaSpacer,
} from "@/components/storefront/JumiaTemplateBlocks";
import { isChildFragmentType } from "@/lib/templates/template-tree";

export const TemplateBlockEditContext = createContext<{ blockId?: string; isEditor?: boolean }>({});

export function useTemplateBlockEditContext() {
  return useContext(TemplateBlockEditContext);
}

const loggedMissingTemplateBlockKeys = new Set<string>();

/* ─── TYPES ─────────────────────────────────────────────────── */

export interface TemplateBlock {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  styleOverrides?: Record<string, unknown>;
  elements?: TemplateBlock[];
}

/* ─── BLOCK TYPE MAP ────────────────────────────────────────── */

type BlockComponent = React.ComponentType<Record<string, unknown>>;

const FASHION_BLOCKS: Record<string, BlockComponent> = {
  fashionHeroSlider: FashionHeroSlider as unknown as BlockComponent,
  fashionPromoBanners: FashionPromoBanners as unknown as BlockComponent,
  fashionSectionTitle: FashionSectionTitle as unknown as BlockComponent,
  fashionProductGrid: FashionProductGrid as unknown as BlockComponent,
  fashionCategoryCards: FashionCategoryCards as unknown as BlockComponent,
  fashionTestimonials: FashionTestimonials as unknown as BlockComponent,
  fashionBlogPosts: FashionBlogPosts as unknown as BlockComponent,
  fashionNewsletter: FashionNewsletter as unknown as BlockComponent,
  fashionFooter: FashionFooter as unknown as BlockComponent,
  fashionFeatures: FashionFeatures as unknown as BlockComponent,
  fashionInstagram: FashionInstagram as unknown as BlockComponent,
  fashionMarquee: FashionMarquee as unknown as BlockComponent,
  fashionCoverBanners: FashionCoverBanners as unknown as BlockComponent,
  fashionAboutContent: FashionAboutContent as unknown as BlockComponent,
  fashionStatsCounters: FashionStatsCounters as unknown as BlockComponent,
  fashionServicesGrid: FashionServicesGrid as unknown as BlockComponent,
  fashionGalleryGrid: FashionGalleryGrid as unknown as BlockComponent,
  fashionVideoSection: FashionVideoSection as unknown as BlockComponent,
  fashionQuoteSection: FashionQuoteSection as unknown as BlockComponent,
  fashionTeamSection: FashionTeamSection as unknown as BlockComponent,
  fashionOfficeLocations: FashionOfficeLocations as unknown as BlockComponent,
  fashionStoreVisit: FashionStoreVisit as unknown as BlockComponent,
  fashionFaqAccordion: FashionFaqAccordion as unknown as BlockComponent,
  fashionContactForm: FashionContactForm as unknown as BlockComponent,
};

const ELECTRONICS_BLOCKS: Record<string, BlockComponent> = {
  electronicsHeroSlider: ElectronicsHeroSlider as unknown as BlockComponent,
  electronicsPromoBanners: ElectronicsPromoBanners as unknown as BlockComponent,
  electronicsProductTabs: ElectronicsProductTabs as unknown as BlockComponent,
  electronicsBannerGrid: ElectronicsBannerGrid as unknown as BlockComponent,
  electronicsHotDeals: ElectronicsHotDeals as unknown as BlockComponent,
  electronicsSideBanner: ElectronicsSideBanner as unknown as BlockComponent,
  electronicsGamingCTA: ElectronicsGamingCTA as unknown as BlockComponent,
  electronicsBlogPosts: ElectronicsBlogPosts as unknown as BlockComponent,
  electronicsPartners: ElectronicsPartners as unknown as BlockComponent,
  electronicsFooter: ElectronicsFooter as unknown as BlockComponent,
  electronicsSectionTitle: ElectronicsSectionTitle as unknown as BlockComponent,
  electronicsAboutContent: ElectronicsAboutContent as unknown as BlockComponent,
  electronicsStatsCounters: ElectronicsStatsCounters as unknown as BlockComponent,
  electronicsServicesGrid: ElectronicsServicesGrid as unknown as BlockComponent,
  electronicsGalleryGrid: ElectronicsGalleryGrid as unknown as BlockComponent,
  electronicsVideoSection: ElectronicsVideoSection as unknown as BlockComponent,
  electronicsQuoteSection: ElectronicsQuoteSection as unknown as BlockComponent,
  electronicsTeamSection: ElectronicsTeamSection as unknown as BlockComponent,
  electronicsOfficeLocations: ElectronicsOfficeLocations as unknown as BlockComponent,
  electronicsStoreVisit: ElectronicsStoreVisit as unknown as BlockComponent,
  electronicsFaqAccordion: ElectronicsFaqAccordion as unknown as BlockComponent,
  electronicsContactForm: ElectronicsContactForm as unknown as BlockComponent,
};

const HARDWARE_BLOCKS: Record<string, BlockComponent> = {
  hardwareSectionTitle: HardwareSectionTitle as unknown as BlockComponent,
  hardwareAboutContent: HardwareAboutContent as unknown as BlockComponent,
  hardwareStatsCounters: HardwareStatsCounters as unknown as BlockComponent,
  hardwareServicesGrid: HardwareServicesGrid as unknown as BlockComponent,
  hardwareGalleryGrid: HardwareGalleryGrid as unknown as BlockComponent,
  hardwareVideoSection: HardwareVideoSection as unknown as BlockComponent,
  hardwareQuoteSection: HardwareQuoteSection as unknown as BlockComponent,
  hardwareTeamSection: HardwareTeamSection as unknown as BlockComponent,
  hardwareOfficeLocations: HardwareOfficeLocations as unknown as BlockComponent,
  hardwareCoverBanners: HardwareCoverBanners as unknown as BlockComponent,
  hardwareStoreVisit: HardwareStoreVisit as unknown as BlockComponent,
  hardwareFaqAccordion: HardwareFaqAccordion as unknown as BlockComponent,
  hardwareContactForm: HardwareContactForm as unknown as BlockComponent,
  hardwareBlogPosts: HardwareBlogPosts as unknown as BlockComponent,
  // Homepage blocks
  hardwareHomeHeroSlider: HardwareHomeHeroSlider as unknown as BlockComponent,
  hardwareHomeCategoryGrid: HardwareHomeCategoryGrid as unknown as BlockComponent,
  hardwareHomeFeaturedProducts: HardwareHomeFeaturedProducts as unknown as BlockComponent,
  hardwareHomeBuildPC: HardwareHomeBuildPC as unknown as BlockComponent,
  hardwareHomePricingTable: HardwareHomePricingTable as unknown as BlockComponent,
  hardwareHomeGearUpCTA: HardwareHomeGearUpCTA as unknown as BlockComponent,
  hardwareHomeCustomDesktops: HardwareHomeCustomDesktops as unknown as BlockComponent,
  hardwareHomeGamingGallery: HardwareHomeGamingGallery as unknown as BlockComponent,
  hardwareHomeTestimonial: HardwareHomeTestimonial as unknown as BlockComponent,
  hardwareHomeLatestEvents: HardwareHomeLatestEvents as unknown as BlockComponent,
  hardwareHomeNewsletter: HardwareHomeNewsletter as unknown as BlockComponent,
  hardwareHomeFooter: HardwareHomeFooter as unknown as BlockComponent,
};

const TOOLS_HOME_BLOCKS: Record<string, BlockComponent> = {
  toolsGridBanners: ToolsGridBanners as unknown as BlockComponent,
  toolsFeatureIcons: ToolsFeatureIcons as unknown as BlockComponent,
  toolsSectionTitle: ToolsSectionTitle as unknown as BlockComponent,
  toolsProductGrid: ToolsProductGrid as unknown as BlockComponent,
  toolsFeatureSection: ToolsFeatureSection as unknown as BlockComponent,
  toolsDeliveryBanner: ToolsDeliveryBanner as unknown as BlockComponent,
  toolsPreFooter: ToolsPreFooter as unknown as BlockComponent,
};

const BAKERY_BLOCKS: Record<string, BlockComponent> = {
  bakeryHeroSlider: BakeryHeroSlider as unknown as BlockComponent,
  bakerySectionTitle: BakerySectionTitle as unknown as BlockComponent,
  bakeryCategoryInfoBoxes: BakeryCategoryInfoBoxes as unknown as BlockComponent,
  bakeryHandmade: BakeryHandmade as unknown as BlockComponent,
  bakeryProductGrid: BakeryProductGrid as unknown as BlockComponent,
  bakeryProcess: BakeryProcess as unknown as BlockComponent,
  bakeryBlogPosts: BakeryBlogPosts as unknown as BlockComponent,
  bakeryCta: BakeryCta as unknown as BlockComponent,
  bakeryFooter: BakeryFooter as unknown as BlockComponent,
  bakeryAboutContent: BakeryAboutContent as unknown as BlockComponent,
  bakeryStatsCounters: BakeryStatsCounters as unknown as BlockComponent,
  bakeryServicesGrid: BakeryServicesGrid as unknown as BlockComponent,
  bakeryGalleryGrid: BakeryGalleryGrid as unknown as BlockComponent,
  bakeryVideoSection: BakeryVideoSection as unknown as BlockComponent,
  bakeryQuoteSection: BakeryQuoteSection as unknown as BlockComponent,
  bakeryTeamSection: BakeryTeamSection as unknown as BlockComponent,
  bakeryOfficeLocations: BakeryOfficeLocations as unknown as BlockComponent,
  bakeryCoverBanners: BakeryCoverBanners as unknown as BlockComponent,
  bakeryStoreVisit: BakeryStoreVisit as unknown as BlockComponent,
  bakeryFaqAccordion: BakeryFaqAccordion as unknown as BlockComponent,
  bakeryContactForm: BakeryContactForm as unknown as BlockComponent,
};

const COSMETICS_BLOCKS: Record<string, BlockComponent> = {
  cosmeticsHeroSlider: CosmeticsHeroSlider as unknown as BlockComponent,
  cosmeticsPromoBanners: CosmeticsPromoBanners as unknown as BlockComponent,
  cosmeticsSectionTitle: CosmeticsSectionTitle as unknown as BlockComponent,
  cosmeticsProductGrid: CosmeticsProductGrid as unknown as BlockComponent,
  cosmeticsCategoryCards: CosmeticsCategoryCards as unknown as BlockComponent,
  cosmeticsDiscovery: CosmeticsDiscovery as unknown as BlockComponent,
  cosmeticsCountdownBanner: CosmeticsCountdownBanner as unknown as BlockComponent,
  cosmeticsInfoBoxes: CosmeticsInfoBoxes as unknown as BlockComponent,
  cosmeticsBlogPosts: CosmeticsBlogPosts as unknown as BlockComponent,
  cosmeticsInstagram: CosmeticsInstagram as unknown as BlockComponent,
  cosmeticsNewsletter: CosmeticsNewsletter as unknown as BlockComponent,
  // cosmeticsFooter - handled at page level, not as block
};

const GROCERY_BLOCKS: Record<string, BlockComponent> = {
  groceryHeroSlider: GroceryHeroSlider as unknown as BlockComponent,
  groceryFeaturesBar: GroceryFeaturesBar as unknown as BlockComponent,
  grocerySectionTitle: GrocerySectionTitle as unknown as BlockComponent,
  groceryProductGrid: GroceryProductGrid as unknown as BlockComponent,
  groceryPromoBanners: GroceryPromoBanners as unknown as BlockComponent,
  groceryCategoryGrid: GroceryCategoryGrid as unknown as BlockComponent,
  groceryNewsletter: GroceryNewsletter as unknown as BlockComponent,
  groceryBestSellers: GroceryBestSellers as unknown as BlockComponent,
  groceryFooter: GroceryFooter as unknown as BlockComponent,
  groceryAboutHero: GroceryAboutHero as unknown as BlockComponent,
  groceryTextSection: GroceryTextSection as unknown as BlockComponent,
  groceryTeamSection: GroceryTeamSection as unknown as BlockComponent,
  groceryFaqSection: GroceryFaqSection as unknown as BlockComponent,
  groceryContactHero: GroceryContactHero as unknown as BlockComponent,
  groceryContactForm: GroceryContactForm as unknown as BlockComponent,
  groceryBlogGrid: GroceryBlogGrid as unknown as BlockComponent,
};

const HEALTH_BLOCKS: Record<string, BlockComponent> = {
  healthHero: HealthHero as unknown as BlockComponent,
  healthMarquee: HealthMarquee as unknown as BlockComponent,
  healthPromoBanners: HealthPromoBanners as unknown as BlockComponent,
  healthSectionTitle: HealthSectionTitle as unknown as BlockComponent,
  healthCategoryCards: HealthCategoryCards as unknown as BlockComponent,
  healthProductGrid: HealthProductGrid as unknown as BlockComponent,
  healthVideoSection: HealthVideoSection as unknown as BlockComponent,
  healthFeatureSection: HealthFeatureSection as unknown as BlockComponent,
  healthTestimonials: HealthTestimonials as unknown as BlockComponent,
  healthBlogPosts: HealthBlogPosts as unknown as BlockComponent,
  healthNewsletter: HealthNewsletter as unknown as BlockComponent,
  healthBrandMarquee: HealthBrandMarquee as unknown as BlockComponent,
  healthFooter: HealthFooter as unknown as BlockComponent,
  healthFooterFull: HealthFooterFull as unknown as BlockComponent,
  healthAboutPage: HealthAboutPage as unknown as BlockComponent,
  healthContactPage: HealthContactPage as unknown as BlockComponent,
  healthBlogPage: HealthBlogPage as unknown as BlockComponent,
  healthIngredientsPage: HealthIngredientsPage as unknown as BlockComponent,
  healthMedicalExpertsPage: HealthMedicalExpertsPage as unknown as BlockComponent,
};

const INTERIOR_BLOCKS: Record<string, BlockComponent> = {
  interiorHeroSlider: InteriorHeroSlider as unknown as BlockComponent,
  interiorSectionTitle: InteriorSectionTitle as unknown as BlockComponent,
  interiorCategoryGrid: InteriorCategoryGrid as unknown as BlockComponent,
  interiorProductGrid: InteriorProductGrid as unknown as BlockComponent,
  interiorInfoBoxes: InteriorInfoBoxes as unknown as BlockComponent,
  interiorGardenProducts: InteriorGardenProducts as unknown as BlockComponent,
  interiorPromoBanners: InteriorPromoBanners as unknown as BlockComponent,
  interiorFurnitureCategories: InteriorFurnitureCategories as unknown as BlockComponent,
  interiorFurnitureProducts: InteriorFurnitureProducts as unknown as BlockComponent,
  interiorBlogPosts: InteriorBlogPosts as unknown as BlockComponent,
  interiorBrandsBar: InteriorBrandsBar as unknown as BlockComponent,
  interiorCta: InteriorCta as unknown as BlockComponent,
  interiorFooter: InteriorFooter as unknown as BlockComponent,
  interiorAboutContent: InteriorAboutContent as unknown as BlockComponent,
  interiorStatsCounters: InteriorStatsCounters as unknown as BlockComponent,
  interiorServicesGrid: InteriorServicesGrid as unknown as BlockComponent,
  interiorGalleryGrid: InteriorGalleryGrid as unknown as BlockComponent,
  interiorVideoSection: InteriorVideoSection as unknown as BlockComponent,
  interiorQuoteSection: InteriorQuoteSection as unknown as BlockComponent,
  interiorTeamSection: InteriorTeamSection as unknown as BlockComponent,
  interiorOfficeLocations: InteriorOfficeLocations as unknown as BlockComponent,
  interiorStoreVisit: InteriorStoreVisit as unknown as BlockComponent,
  interiorFaqAccordion: InteriorFaqAccordion as unknown as BlockComponent,
  interiorContactForm: InteriorContactForm as unknown as BlockComponent,
  accessoriesAboutHero: AccessoriesAboutHero as unknown as BlockComponent,
  accessoriesTeamSection: AccessoriesTeamSection as unknown as BlockComponent,
  accessoriesStrategySection: AccessoriesStrategySection as unknown as BlockComponent,
  accessoriesCommunityCta: AccessoriesCommunityCta as unknown as BlockComponent,
  accessoriesStoreVisit: AccessoriesStoreVisit as unknown as BlockComponent,
  accessoriesFaqAccordion: AccessoriesFaqAccordion as unknown as BlockComponent,
  accessoriesContactForm: AccessoriesContactForm as unknown as BlockComponent,
  accessoriesBlogHeader: AccessoriesBlogHeader as unknown as BlockComponent,
  accessoriesBlogPosts: AccessoriesBlogPosts as unknown as BlockComponent,
  accessoriesProductGrid: AccessoriesProductGrid as unknown as BlockComponent,
  accessoriesFaqsHeader: AccessoriesFaqsHeader as unknown as BlockComponent,
  accessoriesFaqsContactInfo: AccessoriesFaqsContactInfo as unknown as BlockComponent,
  accessoriesCategorizedFaq: AccessoriesCategorizedFaq as unknown as BlockComponent,
  gardenHeroBanner: GardenHeroBanner as unknown as BlockComponent,
  gardenCategoryBanner: GardenCategoryBanner as unknown as BlockComponent,
  gardenDiscountBanner: GardenDiscountBanner as unknown as BlockComponent,
  gardenNewArrivals: GardenNewArrivals as unknown as BlockComponent,
  gardenFeatures: GardenFeatures as unknown as BlockComponent,
  gardenTestimonials: GardenTestimonials as unknown as BlockComponent,
  gardenAboutPage: GardenAboutPage as unknown as BlockComponent,
  gardenContactPage: GardenContactPage as unknown as BlockComponent,
  gardenProductCategory: GardenProductCategory as unknown as BlockComponent,
};

const KIDS_BLOCKS: Record<string, BlockComponent> = {
  kidsAnnouncementBar: KidsAnnouncementBar as unknown as BlockComponent,
  kidsHeroSlider: KidsHeroSlider as unknown as BlockComponent,
  kidsSectionTitle: KidsSectionTitle as unknown as BlockComponent,
  kidsCategoryCards: KidsCategoryCards as unknown as BlockComponent,
  kidsProductGrid: KidsProductGrid as unknown as BlockComponent,
  kidsBundlePromo: KidsBundlePromo as unknown as BlockComponent,
  kidsBlogPosts: KidsBlogPosts as unknown as BlockComponent,
  kidsInstagram: KidsInstagram as unknown as BlockComponent,
  kidsNewsletter: KidsNewsletter as unknown as BlockComponent,
  kidsFooter: KidsFooter as unknown as BlockComponent,
  kidsFooterFull: KidsFooterFull as unknown as BlockComponent,
  kidsHeader: KidsHeader as unknown as BlockComponent,
  kidsAboutHero: KidsAboutHero as unknown as BlockComponent,
  kidsTeamSection: KidsTeamSection as unknown as BlockComponent,
  kidsTextSection: KidsTextSection as unknown as BlockComponent,
  kidsFaqSection: KidsFaqSection as unknown as BlockComponent,
  kidsContactHero: KidsContactHero as unknown as BlockComponent,
  kidsContactInfo: KidsContactInfo as unknown as BlockComponent,
  kidsContactForm: KidsContactForm as unknown as BlockComponent,
  kidsOpeningHours: KidsOpeningHours as unknown as BlockComponent,
};

const TOYS_BLOCKS: Record<string, BlockComponent> = {
  toysFontLoader: ToysFontLoader as unknown as BlockComponent,
  toysHeroSlider: ToysHeroSlider as unknown as BlockComponent,
  toysBannerCards: ToysBannerCards as unknown as BlockComponent,
  toysVideoWelcome: ToysVideoWelcome as unknown as BlockComponent,
  toysFeaturesBar: ToysFeaturesBar as unknown as BlockComponent,
  toysAgeCategories: ToysAgeCategories as unknown as BlockComponent,
  toysSectionTitle: ToysSectionTitle as unknown as BlockComponent,
  toysProductGrid: ToysProductGrid as unknown as BlockComponent,
  toysLimitedOffer: ToysLimitedOffer as unknown as BlockComponent,
  toysTestimonials: ToysTestimonials as unknown as BlockComponent,
  toysNewsletter: ToysNewsletter as unknown as BlockComponent,
  toysFooter: ToysFooter as unknown as BlockComponent,
};

const GADGET_BLOCKS: Record<string, BlockComponent> = {
  gadgetFontLoader: LandingGadgetFontLoader as unknown as BlockComponent,
  gadgetHero: LandingGadgetHero as unknown as BlockComponent,
  landingGadgetHero: LandingGadgetHero as unknown as BlockComponent,
  gadgetStatsBar: LandingGadgetStatsBar as unknown as BlockComponent,
  gadgetFeatureSplit: LandingGadgetFeatureSplit as unknown as BlockComponent,
  landingGadgetFeatures: LandingGadgetFeatureSplit as unknown as BlockComponent,
  gadgetDarkFeature: LandingGadgetDarkFeature as unknown as BlockComponent,
  gadgetPhotoGallery: LandingGadgetPhotoGallery as unknown as BlockComponent,
  gadgetCameraDark: LandingGadgetCameraDark as unknown as BlockComponent,
  gadgetSecurity: LandingGadgetSecurity as unknown as BlockComponent,
  gadgetCameraOptics: LandingGadgetCameraOptics as unknown as BlockComponent,
  gadgetProductsShowcase: LandingGadgetProductsShowcase as unknown as BlockComponent,
  gadgetNewsletter: LandingGadgetNewsletter as unknown as BlockComponent,
  gadgetFooter: LandingGadgetFooter as unknown as BlockComponent,
  gadgetFullWidthImage: LandingGadgetFullWidthImage as unknown as BlockComponent,
};

const AEGIS_BLOCKS: Record<string, BlockComponent> = {
  aegisHeader: AegisHeader as unknown as BlockComponent,
  aegisHero: AegisHero as unknown as BlockComponent,
  aegisServices: AegisServices as unknown as BlockComponent,
  aegisStories: AegisStories as unknown as BlockComponent,
  aegisCTA: AegisCTA as unknown as BlockComponent,
  aegisFooter: AegisFooter as unknown as BlockComponent,
};

const PROKIP_AGENT_BLOCKS: Record<string, BlockComponent> = {
  prokipAgentModal: ProkipAgentModal as unknown as BlockComponent,
  prokipAgentTopBanner: ProkipAgentTopBanner as unknown as BlockComponent,
  prokipAgentHero: ProkipAgentHero as unknown as BlockComponent,
  prokipAgentIntro: ProkipAgentIntro as unknown as BlockComponent,
  prokipAgentAbout: ProkipAgentAbout as unknown as BlockComponent,
  prokipAgentBenefits: ProkipAgentBenefits as unknown as BlockComponent,
  prokipAgentMedia: ProkipAgentMedia as unknown as BlockComponent,
  prokipAgentSupport: ProkipAgentSupport as unknown as BlockComponent,
  prokipAgentConversion: ProkipAgentConversion as unknown as BlockComponent,
  prokipAgentFooter: ProkipAgentFooter as unknown as BlockComponent,
};

const PROKIP_BOOKING_BLOCKS: Record<string, BlockComponent> = {
  prokipBookingHero: ProkipBookingHero as unknown as BlockComponent,
  prokipBookingProblemSection: ProkipBookingProblemSection as unknown as BlockComponent,
  prokipBookingSolution: ProkipBookingSolution as unknown as BlockComponent,
  prokipBookingDemoDetails: ProkipBookingDemoDetails as unknown as BlockComponent,
  prokipBookingTestimonials: ProkipBookingTestimonials as unknown as BlockComponent,
  prokipBookingProcess: ProkipBookingProcess as unknown as BlockComponent,
  prokipBookingForm: ProkipBookingForm as unknown as BlockComponent,
  prokipBookingFooter: ProkipBookingFooter as unknown as BlockComponent,
};

const MAKEUP_BLOCKS: Record<string, BlockComponent> = {
  makeupHeroSlider: MakeupHeroSlider as unknown as BlockComponent,
  makeupCategorySidebar: MakeupCategorySidebar as unknown as BlockComponent,
  makeupSectionTitle: MakeupSectionTitle as unknown as BlockComponent,
  makeupProductGrid: MakeupProductGrid as unknown as BlockComponent,
  makeupProductTypeCards: MakeupProductTypeCards as unknown as BlockComponent,
  makeupBeforeAfter: MakeupBeforeAfter as unknown as BlockComponent,
  makeupPromoBannerCards: MakeupPromoBannerCards as unknown as BlockComponent,
  makeupVideoBlog: MakeupVideoBlog as unknown as BlockComponent,
  makeupBlogPosts: MakeupBlogPosts as unknown as BlockComponent,
  makeupBrandsCarousel: MakeupBrandsCarousel as unknown as BlockComponent,
  makeupFooter: MakeupFooter as unknown as BlockComponent,
  makeupAboutHero: MakeupAboutHero as unknown as BlockComponent,
  makeupTextSection: MakeupTextSection as unknown as BlockComponent,
  makeupTeamSection: MakeupTeamSection as unknown as BlockComponent,
  makeupFaqSection: MakeupFaqSection as unknown as BlockComponent,
  makeupContactHero: MakeupContactHero as unknown as BlockComponent,
  makeupContactForm: MakeupContactForm as unknown as BlockComponent,
  makeupBlogGrid: MakeupBlogGrid as unknown as BlockComponent,
};

const PERFUMES_BLOCKS: Record<string, BlockComponent> = {
  perfumesHeroSlider: PerfumesHeroSlider as unknown as BlockComponent,
  perfumesSectionTitle: PerfumesSectionTitle as unknown as BlockComponent,
  perfumesProductGrid: PerfumesProductGrid as unknown as BlockComponent,
  perfumesOlfactoryTags: PerfumesOlfactoryTags as unknown as BlockComponent,
  perfumesMarquee: PerfumesMarquee as unknown as BlockComponent,
  perfumesFeaturedBanners: PerfumesFeaturedBanners as unknown as BlockComponent,
  perfumesTabbedProducts: PerfumesTabbedProducts as unknown as BlockComponent,
  perfumesCollectionBanners: PerfumesCollectionBanners as unknown as BlockComponent,
  perfumesBlogArticles: PerfumesBlogArticles as unknown as BlockComponent,
  perfumesInstagram: PerfumesInstagram as unknown as BlockComponent,
  perfumesFooter: PerfumesFooter as unknown as BlockComponent,
  perfumesAboutWelcome: PerfumesAboutWelcome as unknown as BlockComponent,
  perfumesAboutMarquee: PerfumesAboutMarquee as unknown as BlockComponent,
  perfumesAboutStory: PerfumesAboutStory as unknown as BlockComponent,
  perfumesWhyChooseUs: PerfumesWhyChooseUs as unknown as BlockComponent,
  perfumesContactHero: PerfumesContactHero as unknown as BlockComponent,
  perfumesContactInfo: PerfumesContactInfo as unknown as BlockComponent,
  perfumesContactForm: PerfumesContactForm as unknown as BlockComponent,
  perfumesBrandedStores: PerfumesBrandedStores as unknown as BlockComponent,
  perfumesPageHero: PerfumesPageHero as unknown as BlockComponent,
  perfumesCollectionsGrid: PerfumesCollectionsGrid as unknown as BlockComponent,
  perfumesJournalGrid: PerfumesJournalGrid as unknown as BlockComponent,
  perfumesReviewsHero: PerfumesReviewsHero as unknown as BlockComponent,
  perfumesReviewsGrid: PerfumesReviewsGrid as unknown as BlockComponent,
  perfumesFeaturedProducts: PerfumesFeaturedProducts as unknown as BlockComponent,
  perfumesFeaturedPosts: PerfumesFeaturedPosts as unknown as BlockComponent,
};

const TSHIRTS_BLOCKS: Record<string, BlockComponent> = {
  tShirtsPrintsHeader: TShirtsPrintsHeader as unknown as BlockComponent,
  tShirtsPrintsFooter: TShirtsPrintsFooter as unknown as BlockComponent,
  tshirtAboutHero: TShirtAboutHero as unknown as BlockComponent,
  tshirtFeatureCards: TShirtFeatureCards as unknown as BlockComponent,
  tshirtImageCallout: TShirtImageCallout as unknown as BlockComponent,
  tshirtContactFormSection: TShirtContactFormSection as unknown as BlockComponent,
  tshirtContactInfo: TShirtContactInfo as unknown as BlockComponent,
  tshirtContactHero: TShirtContactHero as unknown as BlockComponent,
  tshirtBlogPosts: TShirtBlogPosts as unknown as BlockComponent,
};

const VEGETABLE_BLOCKS: Record<string, BlockComponent> = {
  vegetableHero: VegetableHero as unknown as BlockComponent,
  vegetableFeatures: VegetableFeatures as unknown as BlockComponent,
  vegetableMenu: VegetableMenu as unknown as BlockComponent,
  vegetableMenuSections: VegetableMenuSections as unknown as BlockComponent,
  vegetableRecipeGrid: VegetableRecipeGrid as unknown as BlockComponent,
  vegetableAboutHero: VegetableAboutHero as unknown as BlockComponent,
  vegetableTeam: VegetableTeam as unknown as BlockComponent,
  vegetableContact: VegetableContact as unknown as BlockComponent,
  vegetableReservation: VegetableReservation as unknown as BlockComponent,
};

const JUMIA_BLOCKS: Record<string, BlockComponent> = {
  jumiaTopBar: JumiaTopBar as unknown as BlockComponent,
  jumiaHeader: JumiaHeader as unknown as BlockComponent,
  jumiaHeroBanner: JumiaHeroBanner as unknown as BlockComponent,
  jumiaFlashDeals: JumiaFlashDeals as unknown as BlockComponent,
  jumiaCategoryGrid: JumiaCategoryGrid as unknown as BlockComponent,
  jumiaSectionTitle: JumiaSectionTitle as unknown as BlockComponent,
  jumiaProductGrid: JumiaProductGrid as unknown as BlockComponent,
  jumiaPromoBanners: JumiaPromoBanners as unknown as BlockComponent,
  jumiaOfficialStores: JumiaOfficialStores as unknown as BlockComponent,
  jumiaFeaturesBar: JumiaFeaturesBar as unknown as BlockComponent,
  jumiaAppBanner: JumiaAppBanner as unknown as BlockComponent,
  jumiaNewsletter: JumiaNewsletter as unknown as BlockComponent,
  jumiaFooter: JumiaFooter as unknown as BlockComponent,
  jumiaTopDeals: JumiaTopDeals as unknown as BlockComponent,
  jumiaSponsored: JumiaSponsored as unknown as BlockComponent,
  jumiaCategoryDealRow: JumiaCategoryDealRow as unknown as BlockComponent,
  jumiaBrandStoreRow: JumiaBrandStoreRow as unknown as BlockComponent,
  jumiaCategoryIconBar: JumiaCategoryIconBar as unknown as BlockComponent,
  jumiaPromoTiles: JumiaPromoTiles as unknown as BlockComponent,
  jumiaBottomNav: JumiaBottomNav as unknown as BlockComponent,
  jumiaSpacer: JumiaSpacer as unknown as BlockComponent,
};

const AI_BLOCKS: Record<string, BlockComponent> = {
  aiAnnouncementBar: AiAnnouncementBar as unknown as BlockComponent,
  aiHeroVideo: AiHeroVideo as unknown as BlockComponent,
  aiCategoryRow: AiCategoryRow as unknown as BlockComponent,
  aiLargeProductCarousel: AiLargeProductCarousel as unknown as BlockComponent,
  aiPromoTiles: AiPromoTiles as unknown as BlockComponent,
  aiProductCarousel: AiProductCarousel as unknown as BlockComponent,
  aiValueProps: AiValueProps as unknown as BlockComponent,
  aiNewsletter: AiNewsletter as unknown as BlockComponent,
  aiFooter: AiFooter as unknown as BlockComponent,
  aiSectionTitle: AiSectionTitle as unknown as BlockComponent,
};

const ALL_TEMPLATE_BLOCKS: Record<string, BlockComponent> = {
  ...FASHION_BLOCKS,
  ...ELECTRONICS_BLOCKS,
  ...HARDWARE_BLOCKS,
  ...TOOLS_HOME_BLOCKS,
  ...BAKERY_BLOCKS,
  ...COSMETICS_BLOCKS,
  ...GROCERY_BLOCKS,
  ...HEALTH_BLOCKS,
  ...INTERIOR_BLOCKS,
  ...KIDS_BLOCKS,
  ...TOYS_BLOCKS,
  ...MAKEUP_BLOCKS,
  ...PERFUMES_BLOCKS,
  ...TSHIRTS_BLOCKS,
  ...VEGETABLE_BLOCKS,
  ...JUMIA_BLOCKS,
  ...AI_BLOCKS,
  ...GADGET_BLOCKS,
  ...AEGIS_BLOCKS,
  ...PROKIP_AGENT_BLOCKS,
  ...PROKIP_BOOKING_BLOCKS,
};

export const REGISTERED_TEMPLATE_BLOCK_TYPES = new Set(Object.keys(ALL_TEMPLATE_BLOCKS));

const CHILD_COLLECTION_PROP_MAP: Array<[RegExp, string]> = [
  [/linkcolumns?$/i, "linkColumns"],
  [/sociallinks?$/i, "socialLinks"],
  [/slides?$/i, "slides"],
  [/features?$/i, "features"],
  [/banners?$/i, "banners"],
  [/categories?$/i, "categories"],
  [/testimonials?$/i, "testimonials"],
  [/products?$/i, "products"],
  [/items?$/i, "items"],
  [/tabs?$/i, "tabs"],
  [/posts?$/i, "posts"],
  [/links?$/i, "links"],
  [/buttons?$/i, "buttons"],
  [/reviews?$/i, "reviews"],
  [/steps?$/i, "steps"],
  [/images?$/i, "images"],
  [/faqs?$/i, "faqs"],
  [/team(members?)?$/i, "team"],
  [/members?$/i, "members"],
  [/services?$/i, "services"],
  [/brands?$/i, "brands"],
  [/counters?$/i, "counters"],
  [/boxes?$/i, "boxes"],
  [/paragraphs?$/i, "paragraphs"],
  [/videos?$/i, "videos"],
  [/offices?$/i, "offices"],
  [/ingredients?$/i, "ingredients"],
  [/experts?$/i, "experts"],
  [/swatches?$/i, "swatches"],
  [/variants?$/i, "variants"],
  [/infoboxes?$/i, "infoboxes"],
  [/catitems?$/i, "catItems"],
  [/faqitems?$/i, "faqItems"],
  [/teamitems?$/i, "teamItems"],
  [/featureitems?$/i, "featureItems"],
  [/postitems?$/i, "postItems"],
  [/recentposts?$/i, "recentPosts"],
  [/menuitems?$/i, "menuItems"],
  [/navitems?$/i, "navItems"],
  [/navpages?$/i, "navPages"],
];

function isRegisteredTemplateBlock(type: string): boolean {
  return REGISTERED_TEMPLATE_BLOCK_TYPES.has(type);
}

function inferChildCollectionPropKey(type: string): string | null {
  const compactType = type.replace(/[^a-zA-Z0-9]/g, "");
  for (const [pattern, propKey] of CHILD_COLLECTION_PROP_MAP) {
    if (pattern.test(compactType)) {
      return propKey;
    }
  }
  return null;
}

function buildChildTemplateProps(children: TemplateBlock[]): Record<string, unknown> {
  const groupedChildren = new Map<string, TemplateBlock[]>();

  for (const child of children) {
    const propKey = inferChildCollectionPropKey(child.type);
    if (!propKey) continue;
    const bucket = groupedChildren.get(propKey) || [];
    bucket.push(child);
    groupedChildren.set(propKey, bucket);
  }

  const props: Record<string, unknown> = {};
  for (const [propKey, items] of groupedChildren.entries()) {
    props[propKey] = items.map((item) => buildTemplateArrayItemProps(item));
  }
  return props;
}

function buildTemplateArrayItemProps(block: TemplateBlock): Record<string, unknown> {
  const props = {
    ...normalizeStorefrontTemplateProps((block.settings || block.props || {}) as Record<string, unknown>),
  };

  const childBlocks = Array.isArray(block.elements) ? block.elements : [];
  const childProps = buildChildTemplateProps(childBlocks);

  return {
    ...props,
    ...childProps,
  };
}

function buildTemplateNodeLike(block: TemplateBlock): { id: string; type: string; settings: Record<string, unknown>; elements: Array<{ id: string; type: string; settings: Record<string, unknown>; elements: unknown[] }> } {
  const childBlocks = Array.isArray(block.elements) ? block.elements : [];
  return {
    id: block.id,
    type: block.type,
    settings: buildTemplateArrayItemProps(block),
    elements: childBlocks.map((child) => buildTemplateNodeLike(child)),
  };
}

function buildTemplateBlockComponentProps(block: TemplateBlock): Record<string, unknown> {
  const props = {
    ...normalizeStorefrontTemplateProps((block.settings || block.props || {}) as Record<string, unknown>),
  };

  const childBlocks = Array.isArray(block.elements) ? block.elements : [];
  const childProps = buildChildTemplateProps(childBlocks);

  return {
    ...props,
    ...childProps,
    elements: childBlocks.map((child) => buildTemplateNodeLike(child)),
  };
}

function getTemplateBlockListKey(block: TemplateBlock | undefined, index: number, scope: string): string {
  if (block?.id) return block.id;
  const fallbackKey = `${scope}-${index}`;
  if (!loggedMissingTemplateBlockKeys.has(fallbackKey)) {
    loggedMissingTemplateBlockKeys.add(fallbackKey);
    console.warn(`[TemplateBlockRenderer] Missing block id for ${scope}[${index}]; using fallback key "${fallbackKey}"`);
  }
  return fallbackKey;
}

/* ─── FONT LOADER MAP ──────────────────────────────────────── */

const FONT_LOADERS: Record<string, React.ComponentType> = {
  fashion: FashionFontLoader,
  electronics: ElectronicsFontLoader,
  bakery: BakeryFontLoader,
  cosmetics: CosmeticsFontLoader,
  grocery: GroceryFontLoader,
  health: HealthFontLoader,
  interior: InteriorFontLoader,
  kids: KidsFontLoader,
  makeup: MakeupFontLoader,
  perfumes: PerfumesFontLoader,
  "t-shirts-prints": FashionFontLoader,
  vegetables: FashionFontLoader,
  jumia: JumiaFontLoader,
  marketplace: JumiaFontLoader,
  ai: AiFontLoader,
  "landing-gadget": LandingGadgetFontLoader,
  "aegis": AegisLandingFontLoader,
  "aegis-landing": AegisLandingFontLoader,
};

/** Detect which template family a block set belongs to */
function detectTemplateFamily(blocks: TemplateBlock[]): string {
  for (const b of blocks) {
    const t = b.type.toLowerCase();
    if (t.startsWith("aegis")) return "aegis-landing";
    if (t.startsWith("landinggadget")) return "landing-gadget";
    if (t.startsWith("gadget")) return "landing-gadget";
    if (t.startsWith("ai")) return "ai";
    if (t.startsWith("jumia")) return "jumia";
    if (t.startsWith("hardware")) return "electronics";
    if (t.startsWith("electronics")) return "electronics";
    if (t.startsWith("bakery")) return "bakery";
    if (t.startsWith("cosmetics")) return "cosmetics";
    if (t.startsWith("grocery")) return "grocery";
    if (t.startsWith("vegetable")) return "vegetables";
    if (t.startsWith("health")) return "health";
    if (t.startsWith("interior") || t.startsWith("garden")) return "interior";
    if (t.startsWith("kids")) return "kids";
    if (t.startsWith("makeup")) return "makeup";
    if (t.startsWith("perfumes")) return "perfumes";
    if (t.startsWith("tshirtsprints")) return "t-shirts-prints";
    if (t.startsWith("fashion")) return "fashion";
  }
  return "fashion";
}

function buildEditorOverrideCss(blockId: string, styles: CSSProperties, hoverCss = ""): string {
  const scope = `[data-editor-block-id="${blockId}"]`;
  const root = `${scope} > *`;
  const textTargets = `${scope} :is(h1, h2, h3, h4, h5, h6, p, span, a, button, li, label, strong, em, small)`;
  const mediaTargets = `${scope} :is(img, video, svg)`;
  const css: string[] = [];

  if (
    styles.backgroundColor ||
    styles.paddingTop ||
    styles.paddingRight ||
    styles.paddingBottom ||
    styles.paddingLeft ||
    styles.marginTop ||
    styles.marginRight ||
    styles.marginBottom ||
    styles.marginLeft ||
    styles.borderRadius ||
    styles.borderWidth ||
    styles.borderStyle ||
    styles.borderColor ||
    styles.boxShadow ||
    styles.position ||
    typeof styles.zIndex === "number" ||
    typeof styles.opacity === "number" ||
    styles.maxWidth ||
    styles.minWidth ||
    styles.display ||
    styles.justifyContent ||
    styles.alignItems ||
    styles.flexDirection ||
    styles.flexWrap ||
    styles.gap
  ) {
    css.push(`
${scope} {
  ${styles.position ? `position: ${styles.position} !important;` : ""}
  ${typeof styles.zIndex === "number" ? `z-index: ${styles.zIndex} !important;` : ""}
  ${typeof styles.opacity === "number" ? `opacity: ${styles.opacity} !important;` : ""}
  ${styles.maxWidth ? `max-width: ${styles.maxWidth} !important;` : ""}
  ${styles.minWidth ? `min-width: ${styles.minWidth} !important;` : ""}
  ${styles.display ? `display: ${styles.display} !important;` : ""}
  ${styles.justifyContent ? `justify-content: ${styles.justifyContent} !important;` : ""}
  ${styles.alignItems ? `align-items: ${styles.alignItems} !important;` : ""}
  ${styles.flexDirection ? `flex-direction: ${styles.flexDirection} !important;` : ""}
  ${styles.flexWrap ? `flex-wrap: ${styles.flexWrap} !important;` : ""}
  ${styles.gap ? `gap: ${styles.gap} !important;` : ""}
}

${root} {
  ${styles.backgroundColor ? `background-color: ${styles.backgroundColor} !important;` : ""}
  ${styles.paddingTop ? `padding-top: ${styles.paddingTop} !important;` : ""}
  ${styles.paddingRight ? `padding-right: ${styles.paddingRight} !important;` : ""}
  ${styles.paddingBottom ? `padding-bottom: ${styles.paddingBottom} !important;` : ""}
  ${styles.paddingLeft ? `padding-left: ${styles.paddingLeft} !important;` : ""}
  ${styles.marginTop ? `margin-top: ${styles.marginTop} !important;` : ""}
  ${styles.marginRight ? `margin-right: ${styles.marginRight} !important;` : ""}
  ${styles.marginBottom ? `margin-bottom: ${styles.marginBottom} !important;` : ""}
  ${styles.marginLeft ? `margin-left: ${styles.marginLeft} !important;` : ""}
  ${styles.borderRadius ? `border-radius: ${styles.borderRadius} !important;` : ""}
  ${styles.boxShadow ? `box-shadow: ${styles.boxShadow} !important;` : ""}
  ${styles.borderWidth ? `border-width: ${styles.borderWidth} !important;` : ""}
  ${styles.borderStyle ? `border-style: ${styles.borderStyle} !important;` : ""}
  ${styles.borderColor ? `border-color: ${styles.borderColor} !important;` : ""}
}`);
  }

  if (
    styles.color ||
    styles.fontFamily ||
    styles.fontSize ||
    styles.fontWeight ||
    styles.lineHeight ||
    styles.letterSpacing ||
    styles.textAlign ||
    styles.textTransform ||
    styles.textDecoration
  ) {
    css.push(`
${textTargets} {
  ${styles.color ? `color: ${styles.color} !important;` : ""}
  ${styles.fontFamily ? `font-family: ${styles.fontFamily} !important;` : ""}
  ${styles.fontSize ? `font-size: ${styles.fontSize} !important;` : ""}
  ${styles.fontWeight ? `font-weight: ${styles.fontWeight} !important;` : ""}
  ${styles.lineHeight ? `line-height: ${styles.lineHeight} !important;` : ""}
  ${styles.letterSpacing ? `letter-spacing: ${styles.letterSpacing} !important;` : ""}
  ${styles.textAlign ? `text-align: ${styles.textAlign} !important;` : ""}
  ${styles.textTransform ? `text-transform: ${styles.textTransform} !important;` : ""}
  ${styles.textDecoration ? `text-decoration: ${styles.textDecoration} !important;` : ""}
}`);
  }

  if (styles.backgroundColor || styles.borderColor || styles.borderWidth || styles.borderStyle || styles.borderRadius || styles.boxShadow || typeof styles.opacity === "number") {
    css.push(`
${mediaTargets} {
  ${styles.borderRadius ? `border-radius: ${styles.borderRadius} !important;` : ""}
  ${styles.boxShadow ? `box-shadow: ${styles.boxShadow} !important;` : ""}
  ${styles.borderWidth ? `border-width: ${styles.borderWidth} !important;` : ""}
  ${styles.borderStyle ? `border-style: ${styles.borderStyle} !important;` : ""}
  ${styles.borderColor ? `border-color: ${styles.borderColor} !important;` : ""}
  ${typeof styles.opacity === "number" ? `opacity: ${styles.opacity} !important;` : ""}
}`);
  }

  if (hoverCss) {
    css.push(hoverCss);
  }

  return css.join("\n");
}

/* ─── SINGLE BLOCK RENDERER ────────────────────────────────── */

function RenderTemplateBlock({ block, isEditor = false }: { block: TemplateBlock; isEditor?: boolean }) {
  const Component = isRegisteredTemplateBlock(block.type) ? ALL_TEMPLATE_BLOCKS[block.type] : null;

  if (!Component) {
    if (process.env.NODE_ENV === "development" && !isChildFragmentType(block.type)) {
      console.warn(`Unknown template block type: ${block.type}`);
    }
    return null;
  }

  // Resolve style overrides using the universal resolver
  const { styles, classes, overlayStyles, hoverCss } = resolveSectionStyleOverrides(
    block.styleOverrides,
    block.type
  );
  const customCss = typeof block.styleOverrides?.customCss === "string" ? block.styleOverrides.customCss.trim() : "";
  const blockCss = buildEditorOverrideCss(block.id, styles, hoverCss);

  // Forward resolved styles to the component so it can merge them with its own styles
  const componentProps = {
    ...buildTemplateBlockComponentProps(block),
    resolvedStyles: styles,
    resolvedClasses: classes,
    blockId: block.id,
    isEditor,
  };

  return (
    <div
      data-editor-block-id={block.id}
      data-editor-node-id={block.id}
      className={`builder-block-wrapper editor-node-${block.id} ${classes}`.trim()}
      style={styles}
      >
        {(customCss || blockCss) && (
          <style
          dangerouslySetInnerHTML={{
            __html: `${customCss ? `${customCss}\n` : ""}${blockCss}`,
          }}
        />
      )}
      {overlayStyles && <div style={overlayStyles} />}
      <TemplateBlockEditContext.Provider value={{ blockId: block.id, isEditor }}>
        <Component {...componentProps} />
      </TemplateBlockEditContext.Provider>
    </div>
  );
}

/* ─── PER-BLOCK ERROR BOUNDARY ──────────────────────────────────
   A single unguarded field in one block (bad/missing data from an
   editor edit) must not take down the entire live page. Isolating
   each block means the rest of the page still renders if one
   block throws - in editor mode it shows exactly which block and
   error, so it's fixable instead of an opaque blank storefront. */
export class TemplateBlockErrorBoundary extends React.Component<
  { blockType: string; blockId: string; isEditor: boolean; children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { blockType: string; blockId: string; isEditor: boolean; children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`Template block "${this.props.blockType}" (${this.props.blockId}) crashed:`, error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.isEditor) {
        return (
          <div
            data-editor-node-id={this.props.blockId}
            style={{
              margin: "8px",
              padding: "16px",
              borderRadius: "8px",
              border: "1px dashed #ef4444",
              background: "#fef2f2",
              color: "#991b1b",
              fontSize: "13px",
              fontFamily: "monospace",
            }}
          >
            <strong>"{this.props.blockType}" failed to render:</strong> {this.state.error.message}
          </div>
        );
      }
      // Live storefront: fail silently and just skip this one block
      // rather than showing an error to shoppers.
      return null;
    }
    return this.props.children;
  }
}

/* ─── MAIN RENDERER ─────────────────────────────────────────── */

export interface RenderTemplateBlocksProps {
  blocks: TemplateBlock[];
  /** Pass real products to product grid blocks */
  products?: Array<Record<string, unknown>>;
  /** Enable editor mode - prevents navigation and makes elements selectable */
  isEditor?: boolean;
}

export function RenderTemplateBlocks({ blocks, isEditor = false }: RenderTemplateBlocksProps) {
  const family = detectTemplateFamily(blocks);
  const FontLoader = FONT_LOADERS[family] || FashionFontLoader;
  return (
    <div className={`${family}-template`} data-editor-mode={isEditor}>
      <FontLoader />
      {blocks.map((block, index) => (
        <TemplateBlockErrorBoundary
          key={getTemplateBlockListKey(block, index, "template-block")}
          blockType={block.type}
          blockId={block.id}
          isEditor={isEditor}
        >
          <RenderTemplateBlock block={block} isEditor={isEditor} />
        </TemplateBlockErrorBoundary>
      ))}
    </div>
  );
}

/* ─── EXPORTS ───────────────────────────────────────────────── */

export { FASHION_BLOCKS, ALL_TEMPLATE_BLOCKS, RenderTemplateBlock };
export { isRegisteredTemplateBlock };
export type {
  FashionHeroSliderProps,
  FashionPromoBannersProps,
  FashionSectionTitleProps,
  FashionProductGridProps,
  FashionCategoryCardsProps,
  FashionTestimonialsProps,
  FashionBlogPostsProps,
  FashionNewsletterProps,
  FashionFooterProps,
  FashionFeaturesProps,
  FashionInstagramProps,
  FashionMarqueeProps,
  FashionCoverBannersProps,
};
