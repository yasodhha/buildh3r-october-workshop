program birth_control_prescription.aleo {
    // structure to hold personal medical information
    struct PersonalInfo {
        age: u8,
        has_contraindication: bool, // Whether the patient has a medical condition that contraindicates the prescription
    }

    // Transition function to verify eligibility for a birth control prescription
    transition verify_prescription(person: PersonalInfo) -> bool {
        // Age requirement: Must be 18 years or older
        let age_check:bool = person.age >= 18u8;
        // No contraindication: Must not have any contraindications for birth control
        let contraindication_check:bool = !person.has_contraindication;
        // Eligibility is true if both conditions are met
        return age_check && contraindication_check;
    }
}

