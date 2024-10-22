import { userState } from "../../state/userState"
import { useRecoilValue } from "recoil"
import BegnnierArticle from "../../content/begnnier/article";
import IntermmidiateArticle from "../../content/intermmidiate/article";
import AdvanceArticle from "../../content/advance/article"
export default function Article(){
const user = useRecoilValue(userState)
if(!user||(!user.Subscription))return <></>;

const Subscriptionname =  user.Subscription[0]?.package.name?? ""

const RenderPackge= ()=>{
    switch(Subscriptionname){
        case "beginner":
            return <BegnnierArticle/>;
            case "intermediate":
                return <IntermmidiateArticle/>
                case "advanced":
                    return <AdvanceArticle/>    
         default :
         return <></>;   
    }
}

return <>{RenderPackge()}</>

}