import { ResetPassword } from '@/features/Auth/ResetPassword';
import { FullScreenStylingWrapper } from '@/features/Common/StylingWrapper';
import React from 'react';

export default function ResetPasswordPage() {
    return (
        <FullScreenStylingWrapper>
            <ResetPassword />
        </FullScreenStylingWrapper>
    );
}
