/**
 * Data model to communicate between wizard pages
 */
export interface WizardModel {
    name: string;
    role: string;
    yearsInRole: number;
    pronouns: Pronoun;
    funFact: string;
    profileParagraph: string;
}

export enum PronounTypes {
    Male, 
    Female, 
    Neutral
}

export interface Pronoun {
    type: PronounTypes;
    subject: string;
    object: string;
    possessive: string;
    possessivePronoun: string;
    reflexive: string;
}

export enum FunFactOptions {
    
}