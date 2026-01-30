import { ForgotPassword } from '@/features/Auth/ForgotPassword';
import { FullScreenStylingWrapper } from '@/features/Common/StylingWrapper';
import React from 'react';

export default function ForgotPasswordPage() {
    return (
        <FullScreenStylingWrapper>
            <ForgotPassword />
        </FullScreenStylingWrapper>
    );
}
