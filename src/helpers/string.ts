let mimePromise = import('mime');

export const isAudio = (url: string) => url.includes('.wav');

export const GetBufferByBase64 = async (options: { base64: string; name: string }) => {
  const { base64, name } = options;

  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

  if (!matches || matches.length !== 3) throw new Error('Formato de base64 inválido');

  const decodedImg = {
    type: matches[1],
    data: Buffer.from(matches[2], 'base64'),
  };

  // Espera a que se resuelva la promesa y obtén el módulo mime
  const mimeModule = await mimePromise;
  const mime = mimeModule.default;

  const extension = mime.getExtension(decodedImg.type);
  const fileName = `${name}.${extension}`;

  return { fileName, buffer: decodedImg.data };
};
