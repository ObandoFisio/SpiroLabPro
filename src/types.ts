export enum SpiroPattern {
  NORMAL = 'normal',
  OBSTRUCTIVE = 'obstructive',
  RESTRICTIVE = 'restrictive',
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface PatternData {
  theme: {
    color: string;
    bg: string;
  };
  metrics: {
    fev1: string;
    fvc: string;
    ratio: string;
    pef: string;
    notes: string;
  };
  staticVols: {
    vri: string;
    vt: string;
    vre: string;
    vr: string;
  };
  staticCaps: {
    tlc: string;
    vc: string;
    frc: string;
    ic: string;
  };
  fv: DataPoint[];
  vt: DataPoint[];
  spiro: DataPoint[];
  lines: {
    tlc: number;
    rv: number;
  };
}
