declare module 'gifenc' {
  export interface GifWriteOptions { palette: number[][]; delay?: number; repeat?: number }
  export interface GifEncoder {
    writeFrame(indexed: Uint8Array, width: number, height: number, options: GifWriteOptions): void
    finish(): void
    bytes(): Uint8Array
  }
  export function GIFEncoder(): GifEncoder
  export function quantize(rgba: Uint8ClampedArray, maxColors: number): number[][]
  export function applyPalette(rgba: Uint8ClampedArray, palette: number[][]): Uint8Array
}
