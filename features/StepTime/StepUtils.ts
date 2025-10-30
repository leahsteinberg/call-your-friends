async async function useHealthKitAuth() {

    const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization(['HKQuantityTypeIdentifierBloodGlucose'])
    console.log("authorization Status????", authorizationStatus)
    const isAvailable = await isHealthDataAvailable();
    console.log("Is Available ----- ", isAvailable);
    if (authorizationStatus === 1) {
        console.log("should request auth")
        const authStatus2 = await requestAuthorization(); // request read permission for bodyFatPercentage
        console.log("auth status 2", authStatus2)
    }
    if (authorizationStatus === 2) {
        const mostRecentBloodGlucoseSample = useMostRecentQuantitySample('HKQuantityTypeIdentifierBloodGlucose')
        console.log("mostRecentBloodGlucoseSample", mostRecentBloodGlucoseSample)
    }
//     }
}