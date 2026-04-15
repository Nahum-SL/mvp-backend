// Constantes estaticos para tipos de negocio y puntos de dolor, junto con sus tipos derivados
export const BUSINESS_TYPES = [
  { id: 'mype', label: 'MYPE / Emprendedor', icon: 'Store' },
  { id: 'startup', label: 'Startup Tech', icon: 'Rocket' },
  { id: 'corporativo', label: 'Gran Empresa', icon: 'Building2' },
] as const;

export const PAIN_POINTS = [
  { id: 'impuestos', label: 'Carga de Impuestos', icon: 'FileText' },
  { id: 'planillas', label: 'Gestión de Planillas', icon: 'Users' },
  { id: 'legal', label: 'Cumplimiento Legal', icon: 'Gavel' },
  { id: 'estrategia', label: 'Crecimiento y Estrategia', icon: 'TrendingUp' },
] as const;

// Forma correcta de extraer los IDs como Union Types
export type BusinessTypeID = (typeof BUSINESS_TYPES)[number]['id'];
export type PainPointID = (typeof PAIN_POINTS)[number]['id'];

// Opcional para priorizar servicios
export const FEATURED_PRIORITY_IDS = [3, 5];
