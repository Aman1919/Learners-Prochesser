import { packages } from "../constant";
import { useRecoilValue } from "recoil";
import { userState } from "../state/userState";
import { Link } from "react-router-dom";
import { Package } from "../types/schema";
// Define types for Package and User if not already defined

const LearningSection = () => {
  const user = useRecoilValue(userState);

  return (
    <section
      id="learningpackages"
      className="learning-section py-12 bg-black min-h-screen"
    >
      
      <h2 className="text-4xl font-bold text-center mb-12">
        Our Learning Packages
      </h2>
      <div className="package-grid grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-8">
        {packages.map((packageData: Package, index: number) => (
          <div
            className="package-card border rounded-3xl p-6 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gray-500 text-black hover:text-white"
            key={index}
          >
            <h3 className="text-2xl font-bold mb-4">
              {packageData.name}
              {packageData.popularLabel && (
                <span className="bg-yellow-600 text-white font-semibold text-xs uppercase rounded-full px-2 ml-2">
                  {packageData.popularLabel}
                </span>
              )}
              {packageData.recommendedLabel && (
                <span className="bg-yellow-600 text-white font-semibold text-xs uppercase rounded-full px-2 ml-2">
                  {packageData.recommendedLabel}
                </span>
              )}
            </h3>
            <p className="text-xl mb-4 font-bold">{packageData.price}</p>
            <p className="text-gray-900 mb-6 hover:text-white">
              {packageData.description}
            </p>

            <div className="flex justify-center mt-4">
              <Link
                className="bg-yellow-600 text-white font-bold py-2 px-6 rounded-full hover:bg-yellow-500 hover:shadow-lg transition-colors duration-300"
                to={user ? `/prompt/${packageData.type}` : "/register"}
              >
                {packageData.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LearningSection;
