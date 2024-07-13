export const DecodeEvent = {
	DecodeObtainingRaw: 'decode_obtaining_raw',
	DecodeDecodingMetadata: 'decode_decoding_metadata',
	DecodeDecodingRaw: 'decode_decoding_raw',
	DecodePreparingRawDeveloper: 'decode_preparing_raw_developer',
	DecodeDevelopingRaw: 'decode_developing_raw',
	DecodeComplete: 'decode_complete'
} as const;

export type DecodeEventName = (typeof DecodeEvent)[keyof typeof DecodeEvent];

export const prettyEventDesc: Record<DecodeEventName, string> = {
	[DecodeEvent.DecodeObtainingRaw]: 'Obtaining Raw',
	[DecodeEvent.DecodeDecodingMetadata]: 'Decoding Metadata',
	[DecodeEvent.DecodeDecodingRaw]: 'Decoding Raw',
	[DecodeEvent.DecodePreparingRawDeveloper]: 'Preparing Raw Developer',
	[DecodeEvent.DecodeDevelopingRaw]: 'Developing Raw',
	[DecodeEvent.DecodeComplete]: 'Complete'
};
