export interface DesignMockup {
  id: string;
  title: string;
  description: string;
  prompt: string;
  layout: Layout;
  typography: Typography;
  colorScheme: ColorScheme;
  elements: DesignElement[];
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  collaborators: string[];
}

export interface Layout {
  type: 'grid' | 'flexbox' | 'absolute' | 'responsive';
  columns: number;
  rows: number;
  gap: number;
  padding: number;
  breakpoints: Breakpoint[];
  gridTemplate: string;
}

export interface Breakpoint {
  name: 'mobile' | 'tablet' | 'desktop' | 'large';
  width: number;
  columns: number;
  gap: number;
}

export interface Typography {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  palette: string[];
}

export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'icon' | 'button' | 'video' | 'container';
  position: Position;
  size: Size;
  style: ElementStyle;
  content?: string;
  src?: string;
  children?: DesignElement[];
  animation?: Animation;
  interactions?: Interaction[];
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Size {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ElementStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  boxShadow?: string;
  opacity?: number;
  transform?: string;
  filter?: string;
  // Text styles
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface Animation {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'custom';
  duration: number;
  delay: number;
  easing: string;
  direction: 'normal' | 'reverse' | 'alternate';
  iterationCount: number;
}

export interface Interaction {
  type: 'hover' | 'click' | 'focus' | 'scroll';
  action: 'animate' | 'navigate' | 'modal' | 'custom';
  target?: string;
  properties?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'designer' | 'viewer';
  preferences: UserPreferences;
  createdAt: Date;
  lastActive: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  shortcuts: KeyboardShortcuts;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  collaboration: boolean;
}

export interface KeyboardShortcuts {
  [key: string]: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  mockups: DesignMockup[];
  collaborators: User[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  visibility: 'public' | 'private' | 'team';
  allowComments: boolean;
  allowEditing: boolean;
  versionControl: boolean;
}

export interface AIGenerationRequest {
  prompt: string;
  style: string;
  layout: string;
  colorScheme: string;
  typography: string;
  elements: string[];
  constraints: string[];
}

export interface AIGenerationResponse {
  mockups: DesignMockup[];
  suggestions: string[];
  metadata: {
    model: string;
    version: string;
    processingTime: number;
  };
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  participants: User[];
  activeUsers: string[];
  changes: CollaborationChange[];
  startedAt: Date;
  lastActivity: Date;
}

export interface CollaborationChange {
  id: string;
  userId: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'style';
  elementId?: string;
  data: any;
  timestamp: Date;
}

export interface DesignSystem {
  id: string;
  name: string;
  description: string;
  colors: ColorPalette[];
  typography: TypographyScale[];
  components: ComponentLibrary[];
  spacing: SpacingScale;
  shadows: ShadowScale;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorPalette {
  name: string;
  colors: {
    [key: string]: string;
  };
  usage: string[];
}

export interface TypographyScale {
  name: string;
  fontFamily: string;
  sizes: {
    [key: string]: {
      fontSize: number;
      lineHeight: number;
      fontWeight: number;
    };
  };
}

export interface ComponentLibrary {
  name: string;
  components: Component[];
  variants: ComponentVariant[];
}

export interface Component {
  id: string;
  name: string;
  type: string;
  props: ComponentProp[];
  defaultProps: Record<string, any>;
  examples: ComponentExample[];
}

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: any[];
}

export interface ComponentExample {
  name: string;
  props: Record<string, any>;
  preview: string;
}

export interface ComponentVariant {
  name: string;
  props: Record<string, any>;
  description: string;
}

export interface SpacingScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ShadowScale {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'html' | 'react' | 'figma';
  quality: number;
  resolution: number;
  includeMetadata: boolean;
  background: boolean;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  enabled: boolean;
  settings: Record<string, any>;
  dependencies: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  type: 'ai-generation' | 'export' | 'notification' | 'webhook' | 'custom';
  name: string;
  config: Record<string, any>;
  order: number;
  dependencies: string[];
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: Record<string, any>;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  preview_url: string;
  code: string;
  ai_prompts: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  source: string;
  created_by?: string;
}
