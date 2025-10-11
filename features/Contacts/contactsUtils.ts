export const pickPhoneNumber = (phoneNumberInfos) =>  {
    if (phoneNumberInfos.length === 1) {
        return phoneNumberInfos[0];
    }
    const phoneNumber = phoneNumberInfos.find((phoneNumber)=> phoneNumber.label === "mobile" );
    return phoneNumber ? phoneNumber : phoneNumberInfos[0];
}

export const buildFriendUser = (user, phoneNumberObj) => {
    const { firstName, lastName } = user;
    console.log("building friend User", phoneNumberObj)
    return {
        firstName,
        lastName,
        ...phoneNumberObj,
    }
}

export const processContact = (chosenContact) => {
    const chosenPhone = pickPhoneNumber(chosenContact?.phoneNumbers);
    return buildFriendUser(chosenContact, chosenPhone);
}

export const phoneNumberIsValid = (phoneDigits) => {
    const number = Number(phoneDigits)
    if (number && phoneDigits.length === 10
        && Number.isInteger(number) && number >= 0
    ) {
        return true;
    }
    return false;
}

export const cleanPhoneNumber = (phoneNumberString) => {
    return phoneNumberString.slice(phoneNumberString.length - 10)
}

export const createSmsUrl = (token, phoneNumber) => {
    const message = `This is your invite to join me on Call Your Friends, an app to make planning to talk easier! Here is your link token: ${token}`
    return `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
}

export const fakeContact = {
    contactType: 'person',
    firstName: 'FakeJason',
    id: 'A9F2C66B-1C8D-49FE-A2E3-21CAEFDA0A30',
    imageAvailable: false,
    phoneNumbers: [
        {
            countryCode: 'us',
            digits: '+16193015075',
            id: '0B840594-BD7C-4DDC-AE64-CBAC9EA4DFB7',
            label: "mobile",
            number: "+16193015075"
        }
    ]
};