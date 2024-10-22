import { useState } from "react";
// import { useRecoilValue } from "recoil";
// import { userState } from "../state/userState";
// import { packages } from "../constant";
// import {FaCheckCircle} from "react-icons/fa"
import { TabButton } from "../utils";
import Article from "../components/dashboardcomponents/article";
const Dashboard = () => {
  // const user = useRecoilValue(userState);
  const [activeTab, setActiveTab] = useState("Article");

  // const packageData = packages.find((p) => {
  //   return p.type === user?.Subscription[0]?.package?.name || "";
  // });
  
  
  const renderActiveTab = () => {
    switch (activeTab) {
      case "Article":
        return <Article />;
            case "Videos":
        return <h1>Videos</h1>;
      case "Practice":
        return <h1>Practice</h1>
      default:
        return <h1>anlcsa</h1>;
    }
  };
  return (
    <section className="w-full">
    <div className='w-full'>
      <h1 className="text-center text-3xl my-3 bold">Dashboard</h1>
       
        <div className="flex space-x-3 w-full my-4 overflow-x-auto scrollbar-hide">
        <TabButton
          title="Article"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabKey="Article"
          />
          <TabButton
          title="Videos"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabKey="Videos"
        />
        <TabButton
          title="Practice"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabKey="Practice"
        />
        </div>
        <div className="mt-6">{renderActiveTab()}</div>
        
      </div>
    </section>
  );
};

export default Dashboard;
