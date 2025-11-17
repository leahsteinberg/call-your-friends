import { usePostSignOutMutation } from "@/services/authApi";
import { handleAuthQuery } from "../Auth/authUtils";
import EntryButton from "../Auth/EntryButton";

export default function SignOutButton() {
    const [signOutUser] = usePostSignOutMutation();

    return (
        <EntryButton
            title="Sign Out -- DOES NOT WORK"
            onPressQuery={(e) => {handleAuthQuery(e, signOutUser)}}
        />
    );
}
