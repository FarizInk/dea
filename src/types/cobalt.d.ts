interface Picker {
  type: string | 'photo' | 'video';
  url: string;
}

export interface CobaltResponse {
  status: string | 'redirect' | 'stream' | 'picker' | 'tunnel';
  picker?: Picker[];
  url?: string;
  filename?: string;
  audio?: string;
  audioFilename?: string;
}
