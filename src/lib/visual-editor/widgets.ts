import { 
  WidgetDefinition, 
  ElementType, 
  ElementCategory, 
  ElementStyles,
  ElementSettings 
} from "./types";

// Default styles for elements
const defaultStyles: ElementStyles = {
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "1.5",
    letterSpacing: "0",
    textAlign: "left",
    textTransform: "none",
    color: "#171717",
  },
  colors: {
    text: "#171717",
    background: "transparent",
    border: "#e5e5e5",
  },
  spacing: {
    top: "0",
    right: "0",
    bottom: "0",
    left: "0",
  },
  border: {
    width: "0",
    style: "solid",
    color: "#e5e5e5",
    radius: "0",
  },
  background: {
    type: "color",
    color: "transparent",
    position: "center",
    size: "cover",
    repeat: "no-repeat",
    attachment: "scroll",
  },
  effects: {
    boxShadow: "none",
    opacity: 1,
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
  },
  position: {
    type: "static",
    zIndex: 1,
  },
  animation: {
    entrance: "none",
    duration: "0.3s",
    delay: "0s",
    iteration: "1",
    direction: "normal",
    timingFunction: "ease",
  },
};

// Widget definitions
export const widgetDefinitions: WidgetDefinition[] = [
  // Basic Elements
  {
    type: "heading",
    category: "basic",
    name: "Heading",
    description: "Add a heading to your page",
    icon: "Type",
    defaultSettings: {
      text: "Heading Text",
      level: "h2",
      align: "left",
    },
    defaultStyles: {
      ...defaultStyles,
      typography: {
        ...defaultStyles.typography!,
        fontSize: "32px",
        fontWeight: "700",
        lineHeight: "1.2",
      },
    },
    hasChildren: false,
    editableContent: true,
  },
  {
    type: "paragraph",
    category: "basic",
    name: "Text Editor",
    description: "Add rich text content",
    icon: "FileText",
    defaultSettings: {
      content: "Enter your text here. Click to edit.",
      align: "left",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: true,
  },
  {
    type: "button",
    category: "basic",
    name: "Button",
    description: "Add a clickable button",
    icon: "MousePointer",
    defaultSettings: {
      text: "Click Me",
      link: "#",
      variant: "primary",
      size: "medium",
      align: "left",
      fullWidth: false,
    },
    defaultStyles: {
      ...defaultStyles,
      colors: {
        text: "#ffffff",
        background: "#2563eb",
        border: "#2563eb",
        link: "#ffffff",
        linkHover: "#e5e5e5",
      },
      spacing: {
        top: "12px",
        right: "24px",
        bottom: "12px",
        left: "24px",
      },
      border: {
        ...defaultStyles.border!,
        width: "1px",
        radius: "8px",
      },
    },
    hasChildren: false,
    editableContent: true,
  },
  {
    type: "image",
    category: "basic",
    name: "Image",
    description: "Add an image to your page",
    icon: "Image",
    defaultSettings: {
      src: "",
      alt: "Image description",
      size: "full",
      rounded: "medium",
      link: "",
      openInNewTab: false,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "icon",
    category: "basic",
    name: "Icon",
    description: "Add an icon to your page",
    icon: "Star",
    defaultSettings: {
      name: "star",
      size: "24",
      color: "#171717",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "divider",
    category: "basic",
    name: "Divider",
    description: "Add a horizontal divider",
    icon: "Minus",
    defaultSettings: {
      style: "solid",
      thickness: "1",
      color: "#e5e5e5",
      width: "100",
    },
    defaultStyles: {
      ...defaultStyles,
      spacing: {
        top: "24px",
        right: "0",
        bottom: "24px",
        left: "0",
      },
    },
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "spacer",
    category: "basic",
    name: "Spacer",
    description: "Add empty space between elements",
    icon: "MoveVertical",
    defaultSettings: {
      height: "40",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  
  // Layout Elements
  {
    type: "section",
    category: "layout",
    name: "Section",
    description: "Add a section container",
    icon: "Layout",
    defaultSettings: {
      layout: "full-width",
      columns: 1,
    },
    defaultStyles: {
      ...defaultStyles,
      spacing: {
        top: "60px",
        right: "0",
        bottom: "60px",
        left: "0",
      },
    },
    hasChildren: true,
    allowedChildTypes: ["column"],
    editableContent: false,
  },
  {
    type: "column",
    category: "layout",
    name: "Column",
    description: "Add a column within a section",
    icon: "Columns",
    defaultSettings: {
      width: "100",
      gap: "24",
    },
    defaultStyles,
    hasChildren: true,
    editableContent: false,
  },
  {
    type: "container",
    category: "layout",
    name: "Container",
    description: "Add a container to center content",
    icon: "Box",
    defaultSettings: {
      maxWidth: "1200",
      align: "center",
    },
    defaultStyles,
    hasChildren: true,
    editableContent: false,
  },
  {
    type: "grid",
    category: "layout",
    name: "Grid",
    description: "Add a grid layout",
    icon: "Grid3X3",
    defaultSettings: {
      columns: 3,
      gap: "24",
      responsive: true,
    },
    defaultStyles,
    hasChildren: true,
    editableContent: false,
  },
  {
    type: "flex",
    category: "layout",
    name: "Flex Container",
    description: "Add a flex container",
    icon: "AlignHorizontalJustify",
    defaultSettings: {
      direction: "row",
      justify: "flex-start",
      align: "center",
      wrap: "nowrap",
      gap: "16",
    },
    defaultStyles,
    hasChildren: true,
    editableContent: false,
  },
  
  // Media Elements
  {
    type: "video",
    category: "media",
    name: "Video",
    description: "Add a video to your page",
    icon: "Video",
    defaultSettings: {
      src: "",
      poster: "",
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      aspectRatio: "16/9",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "gallery",
    category: "media",
    name: "Image Gallery",
    description: "Add an image gallery",
    icon: "Images",
    defaultSettings: {
      images: [],
      columns: 3,
      gap: "16",
      lightbox: true,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "slider",
    category: "media",
    name: "Image Slider",
    description: "Add an image slider/carousel",
    icon: "ChevronLeftCircle",
    defaultSettings: {
      images: [],
      autoplay: false,
      interval: 5000,
      showArrows: true,
      showDots: true,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  
  // Form Elements
  {
    type: "form",
    category: "forms",
    name: "Form",
    description: "Add a form container",
    icon: "FileInput",
    defaultSettings: {
      action: "",
      method: "post",
      submitText: "Submit",
    },
    defaultStyles,
    hasChildren: true,
    allowedChildTypes: ["input", "textarea", "select", "button"],
    editableContent: false,
  },
  {
    type: "input",
    category: "forms",
    name: "Input Field",
    description: "Add an input field",
    icon: "Input",
    defaultSettings: {
      type: "text",
      placeholder: "Enter text...",
      label: "Label",
      required: false,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: true,
  },
  {
    type: "textarea",
    category: "forms",
    name: "Text Area",
    description: "Add a text area",
    icon: "AlignLeft",
    defaultSettings: {
      placeholder: "Enter your message...",
      label: "Label",
      rows: 4,
      required: false,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: true,
  },
  {
    type: "select",
    category: "forms",
    name: "Select Dropdown",
    description: "Add a select dropdown",
    icon: "ChevronDown",
    defaultSettings: {
      label: "Label",
      options: [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
      ],
      required: false,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: true,
  },
  
  // Commerce Elements
  {
    type: "product",
    category: "commerce",
    name: "Product Card",
    description: "Add a product card",
    icon: "ShoppingBag",
    defaultSettings: {
      productId: "",
      showImage: true,
      showPrice: true,
      showAddToCart: true,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "products",
    category: "commerce",
    name: "Products Grid",
    description: "Add a products grid",
    icon: "ShoppingBag",
    defaultSettings: {
      category: "",
      limit: 8,
      columns: 4,
      showPrice: true,
      showAddToCart: true,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "cart",
    category: "commerce",
    name: "Cart",
    description: "Add a cart display",
    icon: "ShoppingCart",
    defaultSettings: {
      showItems: true,
      showTotal: true,
      showCheckout: true,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  
  // Social Elements
  {
    type: "social-share",
    category: "social",
    name: "Social Share",
    description: "Add social share buttons",
    icon: "Share2",
    defaultSettings: {
      platforms: ["facebook", "twitter", "linkedin", "whatsapp"],
      style: "icons",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "social-follow",
    category: "social",
    name: "Social Follow",
    description: "Add social follow buttons",
    icon: "UserPlus",
    defaultSettings: {
      platforms: [
        { name: "facebook", url: "" },
        { name: "twitter", url: "" },
        { name: "instagram", url: "" },
      ],
      style: "icons",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "testimonial",
    category: "social",
    name: "Testimonial",
    description: "Add a testimonial",
    icon: "MessageCircle",
    defaultSettings: {
      name: "Customer Name",
      role: "Customer Role",
      text: "This is a testimonial from a satisfied customer.",
      rating: 5,
      avatar: "",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: true,
  },
  {
    type: "reviews",
    category: "social",
    name: "Reviews",
    description: "Add customer reviews",
    icon: "Star",
    defaultSettings: {
      productId: "",
      limit: 6,
      showRating: true,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  
  // Marketing Elements
  {
    type: "countdown",
    category: "marketing",
    name: "Countdown Timer",
    description: "Add a countdown timer",
    icon: "Clock",
    defaultSettings: {
      endDate: "",
      title: "Countdown",
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
    },
    defaultStyles,
    hasChildren: false,
    editableContent: true,
  },
  {
    type: "cta",
    category: "marketing",
    name: "Call to Action",
    description: "Add a call to action section",
    icon: "Megaphone",
    defaultSettings: {
      heading: "Take Action Now",
      description: "This is a call to action description.",
      buttonText: "Get Started",
      buttonLink: "#",
      backgroundColor: "#2563eb",
      textColor: "#ffffff",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: true,
  },
  {
    type: "progress-bar",
    category: "marketing",
    name: "Progress Bar",
    description: "Add a progress bar",
    icon: "ProgressBar",
    defaultSettings: {
      value: 75,
      showLabel: true,
      color: "#2563eb",
      height: "8",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "embed",
    category: "marketing",
    name: "Embed",
    description: "Embed external content",
    icon: "Code2",
    defaultSettings: {
      code: "",
      type: "html",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  
  // Advanced Elements
  {
    type: "html",
    category: "advanced",
    name: "HTML Code",
    description: "Add custom HTML code",
    icon: "Code",
    defaultSettings: {
      code: "<div>Custom HTML</div>",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
  {
    type: "shortcode",
    category: "advanced",
    name: "Shortcode",
    description: "Add a shortcode",
    icon: "Brackets",
    defaultSettings: {
      code: "[shortcode]",
    },
    defaultStyles,
    hasChildren: false,
    editableContent: false,
  },
];

// Get widget by type
export const getWidgetByType = (type: ElementType): WidgetDefinition | undefined => {
  return widgetDefinitions.find(w => w.type === type);
};

// Get widgets by category
export const getWidgetsByCategory = (category: ElementCategory): WidgetDefinition[] => {
  return widgetDefinitions.filter(w => w.category === category);
};

// Category labels
export const categoryLabels: Record<ElementCategory, string> = {
  basic: "Basic",
  layout: "Layout",
  media: "Media",
  forms: "Forms",
  commerce: "Commerce",
  social: "Social",
  marketing: "Marketing",
  advanced: "Advanced",
};

// All categories
export const elementCategories: ElementCategory[] = [
  "basic",
  "layout",
  "media",
  "forms",
  "commerce",
  "social",
  "marketing",
  "advanced",
];

export function createElementFromWidget(type: ElementType) {
  const widget = widgetDefinitions.find((item) => item.type === type);
  if (!widget) return null;

  const baseElement: any = {
    id: crypto.randomUUID(),
    type: widget.type,
    parentId: null,
    order: 0,
    visible: true,
    locked: false,
    name: widget.name,
    settings: { ...widget.defaultSettings },
    styles: JSON.parse(JSON.stringify(widget.defaultStyles)),
    responsiveStyles: {},
  };

  if (type === "section" || type === "container") {
    baseElement.layout = "full-width";
    baseElement.columns = [];
    baseElement.backgroundColor = "#ffffff";
    baseElement.padding = { top: "60px", right: "0", bottom: "60px", left: "0" };
    baseElement.margin = { top: "0", right: "0", bottom: "0", left: "0" };
    baseElement.border = { width: "0", style: "solid", color: "#e5e5e5", radius: "0" };
    baseElement.borderRadius = "0";
    baseElement.boxShadow = "none";
  } else if (type === "column") {
    baseElement.width = "100";
    baseElement.gap = "24";
    baseElement.padding = { top: "0", right: "0", bottom: "0", left: "0" };
    baseElement.children = [];
  } else {
    baseElement.content = { ...widget.defaultSettings };
  }

  return baseElement;
}
