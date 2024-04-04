import mime from 'mime/dist/src/index';
export const isAudio = (url: string) => url.includes('.wav');

export const GetBufferByBase64 = (options: { base64: string; name: string }) => {
  const { base64, name } = options;

  const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

  if (matches?.length !== 3) throw Error('Format base64 invalido');

  const decodedImg = {
    type: matches[1],
    data: Buffer.from(matches[2], 'base64'),
  };

  const imageBuffer = decodedImg.data;
  const extension = mime.getExtension(decodedImg.type);
  const fileName = `${name}.${extension}`;

  return { fileName, buffer: imageBuffer };
};
