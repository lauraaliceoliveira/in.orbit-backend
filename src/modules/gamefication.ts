const BASE_EXPERIENCE = 20
const EXPERIENCE_FACTOR = 1.3

export function calculateLevelFromExperience(experience: number) {
  return (
    Math.floor(
      Math.log((experience / BASE_EXPERIENCE) * (EXPERIENCE_FACTOR - 1) + 1) /
        Math.log(EXPERIENCE_FACTOR)
    ) + 1
  )
}

export function calculateExperienceToLevel(level: number) {
  if (level === 1) return 0 // Level 1 starts with 0 additional XP

  return Math.floor(BASE_EXPERIENCE * EXPERIENCE_FACTOR ** (level - 1))
}