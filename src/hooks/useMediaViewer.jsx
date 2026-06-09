import { useState } from "react";

export default function useMediaViewer() {
  const [media, setMedia] = useState(null);

  const openMedia = ({ type = "image", items = [], index = 0 }) => {
    setMedia({ type, items, index });
  };

  const closeMedia = () => setMedia(null);

  return {
    media,
    openMedia,
    closeMedia,
  };
}