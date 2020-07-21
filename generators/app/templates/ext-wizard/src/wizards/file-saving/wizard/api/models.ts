/**
 * Data model to communicate between wizard pages. Represents
 * user's profile.
 */
export interface ProfileModel {
    name: string;
    role: string;
    yearsInRole: number;
    pronouns: Pronoun;
    funFact: string;
    profileParagraph: string;
}

/**
 * Options of Pronoun Types available to user
 */
export enum PronounTypes {
    Male,
    Female,
    Neutral
}

/**
 * Represents a pronoun, conjugated for all contexts
 * it could be used in. For example, 'she/her/hers/herself'
 */
export interface Pronoun {
    type: PronounTypes;
    subject: string;
    object: string;
    possessive: string;
    possessivePronoun: string;
    reflexive: string;
}