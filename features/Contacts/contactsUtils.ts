import * as Contacts from "expo-contacts";
import { SentInvite } from "./types";

export const pickPhoneNumber = (phoneNumberInfos: Contacts.PhoneNumber[]): Contacts.PhoneNumber => {
    if (phoneNumberInfos.length === 1) {
        return phoneNumberInfos[0];
    }
    const phoneNumber = phoneNumberInfos.find((phoneNumber) => phoneNumber.label === "mobile");
    return phoneNumber ? phoneNumber : phoneNumberInfos[0];
};

export const buildFriendUser = (user: Contacts.Contact, phoneNumberObj: Contacts.PhoneNumber): SentInvite => {
    const { firstName, lastName } = user;
    console.log("building friend User", phoneNumberObj);
    return {
        id: user.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userToPhoneNumber: phoneNumberObj.digits || '',
        firstName,
        lastName,
        digits: phoneNumberObj.digits || '',
        label: phoneNumberObj.label,
        number: phoneNumberObj.number,
        countryCode: phoneNumberObj.countryCode,
    };
};

export const processContact = (chosenContact: Contacts.Contact | any): SentInvite => {
    const chosenPhone = pickPhoneNumber(chosenContact?.phoneNumbers || []);
    return buildFriendUser(chosenContact, chosenPhone);
};

export const isPhoneNumberValid = (phoneDigits: string): boolean => {
    const number = Number(phoneDigits);
    if (number && phoneDigits.length === 10
        && Number.isInteger(number) && number >= 0
    ) {
        return true;
    }
    return false;
};

export const cleanPhoneNumber = (phoneNumberString: string): string | null => {
    const shorterPhoneNumber = phoneNumberString.slice(phoneNumberString.length - 10);
    if (isPhoneNumberValid(shorterPhoneNumber)) {
        return shorterPhoneNumber;
    } else {
        return null;
    }
};

export const createSmsUrl = (token: string, phoneNumber: string): string => {
    const message = `This is your invite to join me on Call Your Friends, an app to make planning to talk easier! Here is your link token: ${token}`;
    return `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    // TODO: add an actual link to the app
};

export const formatPhoneNumber = (digits) => {
    if (digits.length === 10) {
        const areaCode = digits.slice(0,3);
        const firstPortion = digits.slice(3,6)
        const secondPortion = digits.slice(6, 10)
        return `(${areaCode}) ${firstPortion}-${secondPortion}`
    }
    console.log("incorrectly formatted digits")
    return digits;
    
}

// export const fakeContact = {
//     contactType: 'person',
//     firstName: 'FakeJason',
//     id: 'A9F2C66B-1C8D-49FE-A2E3-21CAEFDA0A30',
//     imageAvailable: false,
//     phoneNumbers: [
//         {
//             countryCode: 'us',
//             digits: '+16193015075',
//             id: '0B840594-BD7C-4DDC-AE64-CBAC9EA4DFB7',
//             label: "mobile",
//             number: "+16193015075"
//         }
//     ]
// };