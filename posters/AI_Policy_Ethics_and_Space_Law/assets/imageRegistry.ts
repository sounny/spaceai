const baseImages = {
    image1: new URL('./Image_1.jpg', import.meta.url).href,
    image2: new URL('./Image_2.jpg', import.meta.url).href,
    image3: new URL('./Image_3.png', import.meta.url).href,
    image4: new URL('./Image_4.jpg', import.meta.url).href,
    image5: new URL('./Image_5.jpg', import.meta.url).href,
    image6: new URL('./Image_6.png', import.meta.url).href,
    image7: new URL('./Image_7.jpg', import.meta.url).href,
    image8: new URL('./Image_8.jpg', import.meta.url).href,
    image9: new URL('./Image_9.jpg', import.meta.url).href,
    image10: new URL('./Image_10.png', import.meta.url).href,
    image11: new URL('./Image_11.png', import.meta.url).href,
    image12: new URL('./Image_12.jpeg', import.meta.url).href,
    image13: new URL('./Image_13.png', import.meta.url).href,
    image14: new URL('./Image_14.png', import.meta.url).href,
    image15: new URL('./Image_15.png', import.meta.url).href,
    image17: new URL('./Image_17.png', import.meta.url).href,
    image18: new URL('./Image_18.png', import.meta.url).href,
    image19: new URL('./Image_19.jpeg', import.meta.url).href,
};

export const treatyImages = [
    baseImages.image1,
    baseImages.image2,
    baseImages.image3,
    baseImages.image4,
    baseImages.image5,
    baseImages.image6,
    baseImages.image7,
    baseImages.image8,
    baseImages.image9,
];

export const lawFrameworkLogos = [
    baseImages.image10,
    baseImages.image11,
    baseImages.image12,
];

export const currentUseImages = [
    baseImages.image13,
    baseImages.image14,
    baseImages.image15,
    baseImages.image18,
];

export const solutionIllustrations = {
    adaptive: baseImages.image17,
    tech: baseImages.image18,
    meaningful: baseImages.image12,
    binding: baseImages.image15,
} as const;

export const unoosaImage = baseImages.image19;

export type SolutionIllustrationKey = keyof typeof solutionIllustrations;
