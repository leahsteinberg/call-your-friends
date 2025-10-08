export const pickPhoneNumber = (phoneNumberInfos) =>  {
    if (phoneNumberInfos.length === 1) {
        return phoneNumberInfos[0];
    }
    const phoneNumber = phoneNumberInfos.find((phoneNumber)=> phoneNumber.label === "mobile" );
    return phoneNumber ? phoneNumber : phoneNumberInfos[0];
}

export const buildFriendUser = (user, phoneNumber) => {
    console.log("hi-----", {user})
    console.log("what", phoneNumber)
    const { firstName, lastName } = user;
    return {
        firstName,
        lastName,
        ...phoneNumber,
    }
}

export const fakeContact = {contactType: 'person', firstName: 'FakeJason', id: 'A9F2C66B-1C8D-49FE-A2E3-21CAEFDA0A30', imageAvailable: false, phoneNumbers: [{countryCode: 'us', digits: '+16193015075', id: '0B840594-BD7C-4DDC-AE64-CBAC9EA4DFB7', label: "mobile", number: "+16193015074"}]};