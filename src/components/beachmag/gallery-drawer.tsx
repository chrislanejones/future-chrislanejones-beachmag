"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence, MotionConfig, type PanInfo } from "framer-motion";
import Image from "next/image";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Images } from "lucide-react";
import { bodoniModa, dmSans } from "./fonts";

type Direction = "left" | "right";

// Ported from the future-chrislanejones homepage gallery (10-22-2026): the
// polaroid fan in a drawer, a swipeable single polaroid on phones. The window
// size comes from a store, not state set in an effect (React Compiler rule).
const subscribeViewport = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const viewportKey = () => `${window.innerWidth}x${window.innerHeight}`;

function useViewport() {
  const [width, height] = useSyncExternalStore(subscribeViewport, viewportKey, () => "1280x900").split("x").map(Number);
  return { width, height };
}

export type GalleryPhoto = {
  src: string;
  alt: string;
  description: string;
  width?: number;
  height?: number;
};

interface PhotoProps extends GalleryPhoto {
  direction: Direction;
  onClick: () => void;
}

// Group photos have faces in the top third, so crops keep the top and lose the floor.
const FACE_POSITION = "50% 18%";

interface GalleryDrawerProps {
  photos: GalleryPhoto[];
  title?: string;
  description?: string;
  animationDelay?: number;
}

/* -------------------------------------------------------------------------- */
/*                                   Photo                                   */
/* -------------------------------------------------------------------------- */

const Photo = ({
  width = 300,
  height = 300,
  src,
  alt,
  direction: _direction,
  description,
  onClick,
}: PhotoProps) => (
  <motion.button
    className="polaroid relative shadow-xl cursor-pointer transform-gpu focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
    style={{
      width: width + 20,
      height: height + 60,
    }}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    aria-label={`View ${description} bigger`}
  >
    <div className="p-2.5 pb-0">
      <div
        className="relative overflow-hidden"
        style={{ width: width - 5, height: height - 40 }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-full w-full object-cover rounded-sm"
          style={{ objectPosition: FACE_POSITION }}
          sizes={`${width}px`}
        />
      </div>
    </div>
    <div className="px-2.5 py-2 h-12 flex items-center justify-center">
      <p className="polaroid-caption text-center leading-tight">{description}</p>
    </div>
  </motion.button>
);

/* -------------------------------------------------------------------------- */
/*                              Photo Gallery View                           */
/* -------------------------------------------------------------------------- */

const PhotoGallery = ({
  photos,
  animationDelay = 0.5,
  onEnlarge,
}: {
  photos: GalleryPhoto[];
  animationDelay?: number;
  onEnlarge: (photo: GalleryPhoto) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clickedPhotoId, setClickedPhotoId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewport = useViewport();
  const isMobile = viewport.width < 768;
  // Phones 240px; laptops (short screens) 220px to fit the drawer; big desktops 320px.
  const side = isMobile ? 240 : viewport.height < 900 ? 220 : 320;
  const photoSize = { width: side, height: side };

  useEffect(() => {
    const visTimer = setTimeout(() => setIsVisible(true), animationDelay * 1000);
    const loadTimer = setTimeout(() => setIsLoaded(true), (animationDelay + 0.4) * 1000);
    return () => {
      clearTimeout(visTimer);
      clearTimeout(loadTimer);
    };
  }, [animationDelay]);

  // A click brings the photo to the front of the fan and opens it big.
  const handlePhotoClick = (photoId: number, photo: GalleryPhoto | undefined) => {
    setClickedPhotoId(photoId);
    if (photo) onEnlarge(photo);
  };
  // On phones the polaroid is also swiped; a swipe shouldn't count as a tap.
  const dragged = useRef(false);


  /* ---------------------- Photo positions for desktop ---------------------- */
  // Center the actual photo count, rather than reserving five positions.
  const count = Math.min(photos.length, 5);
  const midpoint = (count - 1) / 2;
  const maxAngle = midpoint * 4 * Math.PI / 180;
  const cardWidth = photoSize.width + 20;
  const cardHeight = photoSize.height + 60;
  const rotatedWidth = cardWidth * Math.cos(maxAngle) + cardHeight * Math.sin(maxAngle);
  const availableWidth = Math.min(viewport.width, 1280) - 96;
  const photoSpacing = count > 1 ? Math.min(photoSize.width * 0.6, Math.max(0, (availableWidth - rotatedWidth) / (count - 1))) : 0;
  const positions = [...Array(count).keys()].map((i) => ({
    id: i + 1,
    order: i,
    x: `${(i - midpoint) * photoSpacing}px`,
    y: `${Math.abs(i - midpoint) * 6}px`,
    rotate: (i - midpoint) * 4,
    zIndex: 50 - i * 10,
    direction: (i % 2 === 0 ? "left" : "right") as Direction,
  }));

  type PhotoPosition = (typeof positions)[number];

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const photoVariants = {
    hidden: () => ({ x: 0, y: 0, rotate: 0, scale: 1 }),
    visible: (custom: PhotoPosition) => ({
      x: custom.x,
      y: custom.y,
      rotate: custom.rotate,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 70,
        damping: 12,
        delay: custom.order * 0.15,
      },
    }),
  };

  /* -------------------------------------------------------------------------- */
  /*                                    View                                   */
  /* -------------------------------------------------------------------------- */

  if (isMobile) {
    // Mobile slider with finger swipe gesture and polaroid styling
    const swipeConfidenceThreshold = 80; // minimum drag px before it switches
    const swipePower = (offset: number, velocity: number) =>
      Math.abs(offset) * velocity;

    const handleDragEnd = (
      _: MouseEvent | TouchEvent | PointerEvent,
      { offset, velocity }: PanInfo,
    ) => {
      const swipe = swipePower(offset.x, velocity.x);

      if (swipe < -swipeConfidenceThreshold) {
        // Swipe left → Next photo
        setCurrentIndex((i) => (i + 1) % photos.length);
      } else if (swipe > swipeConfidenceThreshold) {
        // Swipe right → Previous photo
        setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
      }
    };

    // Generate random angles for each photo (consistent per photo)
    const mobileAngles = photos.map((_, i) => {
      const angles = [-8, 5, -3, 7, -5, -6, 4, -4, 6, -7];
      return angles[i % angles.length];
    });

    return (
      <div className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden touch-pan-y">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={photos[currentIndex].src}
            className="absolute inset-0 flex items-center justify-center p-3"
            initial={{ opacity: 0, x: 70, rotate: 0 }}
            animate={{ opacity: 1, x: 0, rotate: mobileAngles[currentIndex] }}
            exit={{ opacity: 0, x: -70, rotate: 0 }}
            transition={{ duration: 0.35 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragStart={() => { dragged.current = true; }}
            onDragEnd={handleDragEnd}
          >
            <motion.button
              className="polaroid relative shadow-xl cursor-grab active:cursor-grabbing transform-gpu focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              style={{
                width: 260,
                height: 320,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onPointerDown={() => { dragged.current = false; }}
              onClick={() => { if (!dragged.current) onEnlarge(photos[currentIndex]); }}
              aria-label={`View ${photos[currentIndex].description} bigger`}
            >
              <div className="p-2.5 pb-0">
                <div
                  className="relative overflow-hidden"
                  style={{ width: 245, height: 245 }}
                >
                  <Image
                    src={photos[currentIndex].src}
                    alt={photos[currentIndex].alt}
                    width={250}
                    height={250}
                    className="h-full w-full object-cover rounded-sm"
                    style={{ objectPosition: FACE_POSITION }}
                    sizes="250px"
                  />
                </div>
              </div>
              <div className="px-2.5 py-2 h-16 flex items-center justify-center">
                <p className="polaroid-caption text-center leading-tight text-sm">
                  {photos[currentIndex].description}
                </p>
              </div>
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* (Keep navigation buttons for accessibility) — the site's silver keys. */}
        <div className="gallery-keys absolute bottom-3 flex justify-center gap-6">
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() =>
              setCurrentIndex((i) => (i - 1 + photos.length) % photos.length)
            }
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => setCurrentIndex((i) => (i + 1) % photos.length)}
          >
            →
          </button>
        </div>
      </div>
    );
  }

  // Desktop scattered polaroid layout
  // Calculate container dimensions based on photo size and spacing
  // Desktop scattered polaroid layout
  const containerHeight = photoSize.height + 60;

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{ height: `clamp(400px, ${containerHeight + 150}px, 600px)` }}
    >
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="relative w-full overflow-visible"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          style={{
            height: `${containerHeight}px`,
          }}
        >
          {[...positions].reverse().map((position, index) => {
            const photoIndex = positions.length - 1 - index;
            const photo = photos[photoIndex];
            return (
              <motion.div
                key={position.id}
                className="absolute"
                style={{
                  left: `calc(50% - ${cardWidth / 2}px)`,
                  top: "0%",
                  zIndex:
                    clickedPhotoId === position.id ? 100 : position.zIndex,
                }}
                variants={photoVariants}
                custom={position}
                animate={
                  clickedPhotoId === position.id
                    ? {
                        x: position.x,
                        y: position.y,
                        rotate: 0,
                        scale: 1.05,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        },
                      }
                    : undefined
                }
              >
                <Photo
                  width={photoSize.width}
                  height={photoSize.height}
                  src={photo?.src || ""}
                  alt={photo?.alt || ""}
                  direction={position.direction}
                  description={photo?.description || ""}
                  onClick={() => handlePhotoClick(position.id, photo)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                Enlarged photo                              */
/* -------------------------------------------------------------------------- */

// The whole photo, uncropped, as a big polaroid over the drawer. A click
// anywhere, the close button or Escape puts it back.
function EnlargedPhoto({ photo, onClose }: { photo: GalleryPhoto; onClose: () => void }) {
  const [ratio, setRatio] = useState(photo.width && photo.height ? photo.width / photo.height : 1);
  return (
    <motion.div
      className="photo-zoom"
      role="dialog"
      aria-modal="true"
      aria-label={photo.description || photo.alt}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button type="button" className="gallery-close photo-zoom-close" autoFocus onClick={onClose}>
        Close photo <span aria-hidden="true">×</span>
      </button>
      <motion.figure
        style={{ "--zoom-ratio": ratio } as CSSProperties}
        initial={{ scale: 0.85, rotate: -4 }}
        animate={{ scale: 1, rotate: -1 }}
        exit={{ scale: 0.9, rotate: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width ?? 1200}
          height={photo.height ?? 1200}
          sizes="(max-width: 600px) 92vw, 540px"
          onLoad={(event) => {
            const img = event.currentTarget;
            if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
          }}
        />
        {photo.description && <figcaption className="polaroid-caption">{photo.description}</figcaption>}
      </motion.figure>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Gallery Drawer                              */
/* -------------------------------------------------------------------------- */

export default function GalleryDrawer({
  photos,
  title = "Gallery Drawer",
  description = "Click a photo to see it bigger.",
  animationDelay = 0.2,
  children,
}: GalleryDrawerProps & { children?: ReactNode }) {
  const isMobile = useViewport().width < 768;
  const [enlarged, setEnlarged] = useState<GalleryPhoto | null>(null);
  // Focus goes back to the polaroid that opened the big photo.
  const opener = useRef<HTMLElement | null>(null);

  const enlarge = (photo: GalleryPhoto) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setEnlarged(photo);
  };
  const shrink = () => {
    setEnlarged(null);
    opener.current?.focus();
  };

  const adjustedDescription = isMobile
    ? "Swipe for the next photo. Tap one to see it bigger."
    : description;

  return (
    // The drawer's framer-motion follows the visitor's reduced-motion setting.
    <MotionConfig reducedMotion="user">
    <Drawer onOpenChange={(open) => { if (!open) setEnlarged(null); }}>
      <DrawerTrigger asChild>
        {children ?? (
          <Button variant="neutral" size="icon" round aria-label="Open photo gallery">
            <Images size={20} className="text-ink" />
          </Button>
        )}
      </DrawerTrigger>

      {/* Portaled outside the page, so it carries the fonts and its own palette (shell.css).
          The inner box scrolls, so the big photo can cover the drawer without scrolling away. */}
      <DrawerContent
        className={`gallery-drawer h-[90dvh] ${bodoniModa.variable} ${dmSans.variable}`}
        onEscapeKeyDown={(event) => {
          // Escape closes the big photo first, then the drawer.
          if (enlarged) {
            event.preventDefault();
            shrink();
          }
        }}
      >
        <div className="isolate min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex justify-end px-4 pt-2">
            <DrawerClose asChild><button type="button" className="gallery-close">Close gallery <span aria-hidden="true">×</span></button></DrawerClose>
          </div>
          <DrawerHeader className="pt-2 pb-2">
            <DrawerTitle className="text-center">
              {title}
            </DrawerTitle>
            <DrawerDescription className="text-center">
              {adjustedDescription}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 pt-0 flex-1 overflow-hidden">
            <PhotoGallery photos={photos} animationDelay={animationDelay} onEnlarge={enlarge} />
          </div>
        </div>
        </div>
        <AnimatePresence>
          {enlarged && <EnlargedPhoto key={enlarged.src} photo={enlarged} onClose={shrink} />}
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
    </MotionConfig>
  );
}
