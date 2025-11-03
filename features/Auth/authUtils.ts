

    
export const handleAuthQuery = async (e: any, authQuery: any, {email, password, phoneNumber}, saveCredentials) => {

    const result = await authQuery({email, password, phoneNumber, name}).unwrap();
    if (result) {
       saveCredentials({ token: result.token, user: result.user })
    } else {
        console.log("error logging in / signing in")
    }
}