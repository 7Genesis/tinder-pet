// Relógio do aplicativo, isolado para leitura da hora atual em um só lugar.
export function currentTime(): number {
  return Date.now();
}
