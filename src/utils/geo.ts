// Simple geo utilities for responder assignment

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findBestResponder(
  emergencyLat: number,
  emergencyLon: number,
  emergencyType: string,
  responders: Array<{
    id: string;
    latitude: number | null;
    longitude: number | null;
    skills: string[];
    isActive: boolean;
  }>
) {
  // Filter active responders with matching skills
  const matchingResponders = responders.filter((responder) => {
    if (!responder.isActive || !responder.latitude || !responder.longitude) {
      return false;
    }

    // Skill matching logic
    const responderSkills = responder.skills.map(skill => skill.toLowerCase());
    const emergencyTypeLower = emergencyType.toLowerCase();
    
    // Map emergency types to responder skills
    const skillMapping: { [key: string]: string[] } = {
      'fire': ['fire brigade'],
      'medical': ['ambulance'],
      'police': ['police'],
      'general': ['police', 'ambulance', 'fire brigade'] // General can use any skill
    };

    const requiredSkills = skillMapping[emergencyTypeLower] || ['police', 'ambulance', 'fire brigade'];
    
    return requiredSkills.some(skill => 
      responderSkills.some(responderSkill => 
        responderSkill.includes(skill.toLowerCase())
      )
    );
  });

  if (matchingResponders.length === 0) {
    return null;
  }

  // Find closest responder
  let bestResponder = null;
  let shortestDistance = Infinity;

  for (const responder of matchingResponders) {
    const distance = calculateDistance(
      emergencyLat,
      emergencyLon,
      responder.latitude!,
      responder.longitude!
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      bestResponder = responder;
    }
  }

  return bestResponder ? {
    responder: bestResponder,
    distance: shortestDistance
  } : null;
}
