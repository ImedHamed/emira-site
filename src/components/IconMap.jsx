import { FaBolt, FaTools, FaCog, FaIndustry, FaShieldAlt, FaPlug, FaTachometerAlt, FaLeaf, FaWrench, FaHardHat, FaBuilding, FaLandmark, FaHotel, FaHospital, FaUniversity, FaMapMarkerAlt, FaUsers, FaAward, FaPhoneAlt } from 'react-icons/fa'
import { HiLightningBolt } from 'react-icons/hi'

const iconMap = {
    FaBolt: <FaBolt />,
    FaTools: <FaTools />,
    FaCog: <FaCog />,
    FaIndustry: <FaIndustry />,
    FaShieldAlt: <FaShieldAlt />,
    FaPlug: <FaPlug />,
    FaTachometerAlt: <FaTachometerAlt />,
    FaLeaf: <FaLeaf />,
    FaWrench: <FaWrench />,
    FaHardHat: <FaHardHat />,
    FaBuilding: <FaBuilding />,
    FaLandmark: <FaLandmark />,
    FaHotel: <FaHotel />,
    FaHospital: <FaHospital />,
    FaUniversity: <FaUniversity />,
    HiLightningBolt: <HiLightningBolt />,
    FaMapMarkerAlt: <FaMapMarkerAlt />,
    FaUsers: <FaUsers />,
    FaAward: <FaAward />,
    FaPhoneAlt: <FaPhoneAlt />,
}

export function getIcon(name) {
    return iconMap[name] || <FaBolt />
}

export default iconMap
