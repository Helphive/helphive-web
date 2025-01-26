// Use static imports for images
import publicAreaAttendantImage from "../../assets/icons/user-tabs/home/public-area-attendant.jpeg";
import roomAttendantImage from "../../assets/icons/user-tabs/home/room-attendant.jpeg";
import linenPorterImage from "../../assets/icons/user-tabs/home/linen-porter.jpg";

const services = [
  {
    id: 1,
    name: "Public Area Attendant",
    image: publicAreaAttendantImage,
    description: "Ensure the highest standards of cleanliness and order in public areas.",
    averageRate: "$45/hour",
  },
  {
    id: 2,
    name: "Room Attendant",
    image: roomAttendantImage,
    description: "Maintain guest rooms to the highest standards of cleanliness and comfort.",
    averageRate: "$35/hour",
  },
  {
    id: 3,
    name: "Linen Porter",
    image: linenPorterImage,
    description: "Efficiently manage and distribute linens to ensure smooth operations.",
    averageRate: "$60/hour",
  },
];

export default services;
