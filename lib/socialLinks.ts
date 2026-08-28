import {
  faInstagram,
  faXTwitter,
  faBluesky,
  faLinkedinIn,
  faYoutube,
  type IconDefinition,
} from "@fortawesome/free-brands-svg-icons";

export interface SocialLink {
  name: string;
  /** null = not live yet — filtered out of any rendered list. Fill in when the account exists. */
  href: string | null;
  icon: IconDefinition;
}

/**
 * Single source of truth for the site's social links. Add a URL here and it
 * shows up everywhere `SocialLinks` is rendered — no other file to touch.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  { name: "Instagram", href: "https://www.instagram.com/dialogue.forge/", icon: faInstagram },
  { name: "X", href: "https://x.com/ForgeDialogue", icon: faXTwitter },
  { name: "Bluesky", href: "https://bsky.app/profile/dialogueforge.bsky.social", icon: faBluesky },
  { name: "LinkedIn", href: null, icon: faLinkedinIn },
  { name: "YouTube", href: null, icon: faYoutube },
];
