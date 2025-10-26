export interface AudioMetrics {
  duration: number;
  sampleRate: number;
  averageVolume: number;
  pitchVariance: number;
  silentPauses: { start: number; duration: number }[];
}

export const processAudioFile = async (file: File): Promise<AudioMetrics> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);

  let sumVolume = 0;
  const volumeSamples: number[] = [];
  const windowSize = Math.floor(sampleRate * 0.1);

  for (let i = 0; i < channelData.length; i += windowSize) {
    let windowSum = 0;
    const end = Math.min(i + windowSize, channelData.length);
    for (let j = i; j < end; j++) {
      windowSum += Math.abs(channelData[j]);
    }
    const avgVolume = windowSum / (end - i);
    volumeSamples.push(avgVolume);
    sumVolume += avgVolume;
  }

  const averageVolume = sumVolume / volumeSamples.length;

  const silentPauses: { start: number; duration: number }[] = [];
  let pauseStart = -1;
  const silenceThreshold = averageVolume * 0.1;

  volumeSamples.forEach((volume, index) => {
    const time = (index * windowSize) / sampleRate;
    if (volume < silenceThreshold) {
      if (pauseStart === -1) {
        pauseStart = time;
      }
    } else {
      if (pauseStart !== -1) {
        const pauseDuration = time - pauseStart;
        if (pauseDuration > 2) {
          silentPauses.push({ start: pauseStart, duration: pauseDuration });
        }
        pauseStart = -1;
      }
    }
  });

  const frequencies: number[] = [];
  for (let i = 0; i < channelData.length; i += Math.floor(sampleRate * 0.05)) {
    frequencies.push(channelData[i]);
  }
  const meanFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
  const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - meanFreq, 2), 0) / frequencies.length;
  const pitchVariance = Math.sqrt(variance);

  audioContext.close();

  return {
    duration,
    sampleRate,
    averageVolume,
    pitchVariance,
    silentPauses,
  };
};

export const extractWaveformData = async (file: File, samples: number = 200): Promise<number[]> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    let sum = 0;

    for (let j = start; j < end && j < channelData.length; j++) {
      sum += Math.abs(channelData[j]);
    }

    waveform.push(sum / blockSize);
  }

  audioContext.close();
  return waveform;
};
