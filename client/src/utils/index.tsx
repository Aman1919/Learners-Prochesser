/* eslint-disable react/prop-types */
export function TabButton({title,activeTab,setActiveTab,tabKey}) {
  return (
    <div
      className={`py-2 px-4 border-b-4 transition-colors cursor-pointer text-sm md:text-base w-full md:w-[48%] text-center duration-300 ${
        tabKey === activeTab
          ? "border-yellow-500 text-yellow-500"
          : "border-transparent hover:border-gray-200 text-gray-400 hover:text-white"
      }`}
      onClick={() => setActiveTab(tabKey)}
    >
      {title}
    </div>
);
}  