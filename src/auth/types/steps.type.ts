export type NextStep = {
	nextStep: 'idle' | 'verification' | 'generate-otp' | 'otp';
};

export type NextStepWithOtpToken = NextStep & {
	otpToken: string;
};
