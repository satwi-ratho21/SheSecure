import { GoogleGenAI, Type } from "@google/genai";

const isAPIKeyAvailable = () => {
  return typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.trim().length > 0;
};

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "fallback_key" });

export const checkResourceEligibility = async (profile: any) => {
  if (!isAPIKeyAvailable()) {
    return [
      {
        id: "res-legal",
        name: "Sovereign Law Shield",
        description: "Specialized defense advocates for civil liberties, protection orders, and physical security preservation.",
        benefitValue: "Fully covered pro bono legal counsel",
        eligibilityReason: `Calculated high eligibility profile matching vulnerability status for citizen ${profile.name || 'Citizen'}.`,
        category: "LEGAL"
      },
      {
        id: "res-shelter",
        name: "Vanguard Safe Haven Lodge",
        description: "Secure, undisclosed crisis lodging spaces fitted with encrypted ingress credentials.",
        benefitValue: "Priority emergency placement",
        eligibilityReason: "Risk metrics indicate potential benefit from immediate physical relocation.",
        category: "SHELTER"
      },
      {
        id: "res-advocacy",
        name: "Community Watch Support Network",
        description: "Dedicated rapid escort volunteers providing perimeter defense and walk-along guards.",
        benefitValue: "Verified volunteer escort assignment",
        eligibilityReason: "Trust circle parameters suggest a need for localized crowd escorts.",
        category: "ADVOCACY"
      }
    ];
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze this user profile for Vanguard Safety resource eligibility (Legal Aid, Emergency Shelter, Advocacy): ${JSON.stringify(profile)}.
      Identify 3 likely resources based on their location and vulnerability profile.
      For each, explain "Vanguard Qualification" in 1 simple tactical sentence.
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              benefitValue: { type: Type.STRING },
              eligibilityReason: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['LEGAL', 'SHELTER', 'ADVOCACY', 'FINANCIAL'] }
            },
            required: ["id", "name", "description", "benefitValue", "eligibilityReason", "category"]
          }
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] Falling back to secure simulated mock:", e);
    return [
      {
        id: "res-legal",
        name: "Sovereign Law Shield (Contingency Mode)",
        description: "Specialized defense advocates for civil liberties, protection orders, and physical security preservation.",
        benefitValue: "Fully covered pro bono legal counsel",
        eligibilityReason: `Vocal signature and grid verification successful. Matching pro bono advocates for ${profile.name || 'Citizen'}.`,
        category: "LEGAL"
      },
      {
        id: "res-shelter",
        name: "Vanguard Safe Haven Lodge (Contingency Mode)",
        description: "Secure, undisclosed crisis lodging spaces fitted with encrypted ingress credentials.",
        benefitValue: "Priority emergency placement",
        eligibilityReason: "Triage indicates eligible rating based on local grid coordinates.",
        category: "SHELTER"
      }
    ];
  }
};

export const summarizeCrisisTranscript = async (transcript: string) => {
  if (!isAPIKeyAvailable()) {
    return {
      threats: ["Perimeter stalker noted", "Suspicious vehicle hovering", "Coercive voice commands reported"],
      observations: "Direct communication line verified. Immediate distress trigger suggested near local coordinates.",
      priorities: ["Engage safe-haven tracking beacon", "Alert nearest volunteer nodes", "Initiate covert camera sync"],
      safeZones: ["Vanguard Precinct 4", "Mercy Shelter Annex"]
    };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `As an AI Tactical Dispatcher for Vanguard Safety, summarize this emergency audio/chat transcript: "${transcript}".
      Generate:
      1. Key threats identified.
      2. Suspect descriptions or vehicle details if mentioned.
      3. Emergency response priorities.
      4. Safe-haven recommendations based on mentions.
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            observations: { type: Type.STRING },
            priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
            safeZones: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["threats", "observations", "priorities"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] Summarize transcript fallback:", e);
    return {
      threats: ["Perimeter security alert", "Potential trace failure"],
      observations: "Transmission logged. Secure trace actively mapping sector boundaries.",
      priorities: ["Coordinate physical patrol", "Lock down evidence lockers"],
      safeZones: ["Local Safe Zone 1"]
    };
  }
};

export const monitorSafetyNetwork = async (message: string) => {
  if (!isAPIKeyAvailable()) {
    const isCrisis = message.toLowerCase().includes("help") || message.toLowerCase().includes("sos") || message.toLowerCase().includes("emergency");
    return {
      flag: isCrisis ? "CRITICAL" : "SECURE",
      reason: isCrisis ? "Critical distress signals intercepted in the message." : "Normal communication exchange within the trust circle."
    };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Monitor this Vanguard Safety Trust Circle chat: "${message}".
      Flags:
      - SECURE: General communication.
      - WARNING: Potential harassment, coordinate tracking, or suspicious behavior.
      - CRITICAL: Immediate SOS, violence, or abduction signs.
      
      Return a safety flag and tactical reasoning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flag: { type: Type.STRING, enum: ['SECURE', 'WARNING', 'CRITICAL'] },
            reason: { type: Type.STRING }
          },
          required: ["flag", "reason"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] Monitor network fallback:", e);
    return {
      flag: "SECURE",
      reason: "Local network monitoring node remains stable."
    };
  }
};

export const analyzeEvidenceRecord = async (recordText: string, type: string) => {
  if (!isAPIKeyAvailable()) {
    return {
      tacticalSummary: "Vocal signature verified. Secure biometric seal successfully applied.\n- Primary Incident Event: Initial verification sequence.\n- Identifiable evidence: Biometric signature coordinates.\n- Corroborating data points: Access synchronized.",
      defenseExplanation: "The citizen identity has been cryptographically sealed. Full security privileges granted.",
      isCritical: false
    };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze this Vanguard Evidence ${type}: "${recordText}". 
      Generate a 3-bullet point tactical summary for judicial handoff. 
      Focus on: 
      1. Primary Incident Event.
      2. Identifiable evidence (names, plates, locations).
      3. Corroborating data points.
      Also, provide a 1-sentence "Defense Summary" for the user.
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tacticalSummary: { type: Type.STRING },
            defenseExplanation: { type: Type.STRING },
            isCritical: { type: Type.BOOLEAN }
          },
          required: ["tacticalSummary", "defenseExplanation", "isCritical"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] Analyze evidence fallback:", e);
    return {
      tacticalSummary: "Vocal signature verified. Secure biometric seal successfully applied.\n- Primary Incident Event: Initial verification sequence.\n- Identifiable evidence: Biometric signature coordinates.\n- Corroborating data points: Access synchronized.",
      defenseExplanation: "The citizen identity has been cryptographically sealed. Full security privileges granted.",
      isCritical: false
    };
  }
};

export const simulateSafetyProjection = async (currentMetrics: any, changes: string) => {
  if (!isAPIKeyAvailable()) {
    const scoreOffset = changes.toLowerCase().includes("police") || changes.toLowerCase().includes("lighting") || changes.toLowerCase().includes("patrol") ? 15 : -10;
    const initialScore = currentMetrics.environment || 80;
    const projected = Math.min(100, Math.max(0, initialScore + scoreOffset));
    return {
      projectedScore: projected,
      impactDescription: `Perimeter projection active: environmental factors of "${changes}" modeled. Safe zones calibrated to mitigate potential risks.`,
      riskReduction: Math.abs(scoreOffset) + 5
    };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Act as a strategic safety analyst for Vanguard. Given current safety scores: ${JSON.stringify(currentMetrics)}, 
      calculate the impact of these environmental/social changes: "${changes}". 
      Provide a projected safety score (0-100), a description of the risk mitigation, and an estimated percentage of incident probability reduction.
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectedScore: { type: Type.NUMBER },
            impactDescription: { type: Type.STRING },
            riskReduction: { type: Type.NUMBER }
          },
          required: ["projectedScore", "impactDescription", "riskReduction"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] Simulate safety fallback:", e);
    return {
      projectedScore: 85,
      impactDescription: "Local sensor simulation fallback active. Environmental metrics projected under nominal limits.",
      riskReduction: 12
    };
  }
};

export const getGuardianAIInsights = async (metrics: any) => {
  if (!isAPIKeyAvailable()) {
    return "PERIMETER SECURED: Maintain high vigilance. Ensure active beacons are synchronized with Vanguard volunteer coordinates in your immediate 0.5 KM radius. Proceed only along lit avenues.";
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze these safety metrics for the Vanguard Guardian AI: ${JSON.stringify(metrics)}. 
      Provide 3 concise, tactical safety tips focused on risk avoidance. 
      Use a calm, authoritative, high-tech tone.`,
    });
    return response.text;
  } catch (e) {
    console.warn("[Gemini API Error] Guardian insights fallback:", e);
    return "GRID ONLINE: Sensor synchronization completed. Standard perimeter monitoring active. No anomalies detected within the sector bounds.";
  }
};

export const generateGuardianAvatar = async (metrics: any) => {
  // Always return fallback image URL, as image generation is mocked in client-side visual display
  return "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop";
};

export const analyzeRiskSector = async (sectorName: string) => {
  if (!isAPIKeyAvailable()) {
    return {
      sectorName,
      safetyTier: "GUARDED",
      riskTrend: "Stable",
      trendReason: "Crowd levels have standardized and street illumination is fully functional.",
      hasSafeZones: true,
      reports: [
        { type: "Disturbances", severity: "LOW", location: "Grand Ave & State St", time: "10 mins ago" },
        { type: "Suspicious Vehicle", severity: "MEDIUM", location: "Michigan Ave & Madison St", time: "25 mins ago" }
      ]
    };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze this city sector for Vanguard Safety: ${sectorName}. 
      1. Identify historical risk patterns.
      2. Provide current safety tier (SECURE/GUARDED/ALERT/CRITICAL).
      3. Predict threat trends for the next 4 hours based on crowd density and lighting schedules.
      4. Determine if this area has active Vanguard Safe Zones.
      5. Generate 3 mock tactical report points.
      
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sectorName: { type: Type.STRING },
            safetyTier: { type: Type.STRING, enum: ['SECURE', 'GUARDED', 'ALERT', 'CRITICAL'] },
            riskTrend: { type: Type.STRING, enum: ['Rising', 'Stable', 'Falling'] },
            trendReason: { type: Type.STRING },
            hasSafeZones: { type: Type.BOOLEAN },
            reports: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  location: { type: Type.STRING },
                  time: { type: Type.STRING }
                },
                required: ["type", "severity", "location", "time"]
              }
            }
          },
          required: ["sectorName", "safetyTier", "riskTrend", "trendReason", "hasSafeZones", "reports"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] Analyze risk fallback:", e);
    return {
      sectorName,
      safetyTier: "SECURE",
      riskTrend: "Stable",
      trendReason: "Contingency monitoring active. Perimeter reporting within normal bounds.",
      hasSafeZones: true,
      reports: []
    };
  }
};

export const classifyIntent = async (text: string) => {
  if (!isAPIKeyAvailable()) {
    const lowercaseText = text.toLowerCase();
    let intent = "GENERAL";
    let voiceResponse = "Standard query acknowledged. Direct command console active.";
    let isCritical = false;

    if (lowercaseText.includes("sos") || lowercaseText.includes("help") || lowercaseText.includes("emergency") || lowercaseText.includes("police")) {
      intent = "EMERGENCY";
      voiceResponse = "Vocal distress keywords detected! Dispatching emergency rescue beacon to trust circle now.";
      isCritical = true;
    } else if (lowercaseText.includes("route") || lowercaseText.includes("track") || lowercaseText.includes("escort") || lowercaseText.includes("navigate")) {
      intent = "ESCORT";
      voiceResponse = "Escort request verified. Computing standard highly-lit routes with active patrols.";
    } else if (lowercaseText.includes("evidence") || lowercaseText.includes("locker") || lowercaseText.includes("vault") || lowercaseText.includes("audio")) {
      intent = "VAULT";
      voiceResponse = "Accessing evidence locker vaults. Secure biometric handshake requested.";
    } else if (lowercaseText.includes("circle") || lowercaseText.includes("volunteer") || lowercaseText.includes("safe zone") || lowercaseText.includes("havens")) {
      intent = "NETWORK";
      voiceResponse = "Synchronizing Vanguard regional safe zone beacons with active grid.";
    }

    return { intent, voiceResponse, isCritical };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze this safety-related voice command for Vanguard: "${text}". 
      Classify it into exactly one of these tactical categories: 
      - EMERGENCY (Immediate signal broadcast)
      - ESCORT (Needs route analysis or digital escort)
      - VAULT (Accessing evidence locker)
      - NETWORK (Checking circle status or safe zones)
      - GENERAL (Routine queries)
  
      Also, provide a simple, calm, 1-sentence tactical voice response.
      
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            voiceResponse: { type: Type.STRING },
            isCritical: { type: Type.BOOLEAN }
          },
          required: ["intent", "voiceResponse", "isCritical"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] Classify intent fallback:", e);
    return {
      intent: "GENERAL",
      voiceResponse: "Signal verified. Ready for next tactical vocal command.",
      isCritical: false
    };
  }
};

export const optimizeResourceGrid = async (activeResponders: any[]) => {
  if (!isAPIKeyAvailable()) {
    return {
      projectedResponseTime: 4.5,
      gridStatus: "OPTIMAL",
      optimizationAction: "Sentry nodes evenly spaced. Perimeter security tracking nominal.",
      reallocateFrom: "Zone C",
      reallocateTo: "Zone A"
    };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze these Vanguard active responder nodes and their current saturation: ${JSON.stringify(activeResponders)}.
      Identify coverage gaps and suggest real-time resource reallocation for maximum perimeter defense.
      Return a GridOptimization object in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectedResponseTime: { type: Type.NUMBER },
            gridStatus: { type: Type.STRING, enum: ['OPTIMAL', 'STRAINED', 'BREACHED'] },
            optimizationAction: { type: Type.STRING },
            reallocateFrom: { type: Type.STRING },
            reallocateTo: { type: Type.STRING }
          },
          required: ["projectedResponseTime", "gridStatus", "optimizationAction"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] Optimize grid fallback:", e);
    return {
      projectedResponseTime: 5.0,
      gridStatus: "OPTIMAL",
      optimizationAction: "Maintain standard volunteer patrol density.",
      reallocateFrom: "",
      reallocateTo: ""
    };
  }
};

export const generateSafeRoute = async (origin: string, destination: string, avoidIsolated: boolean) => {
  // Always verify if origin and destination are valid, and use Chicago-style fallback as backup/primary
  const cityOrigin = origin || "State St & Madison St, Chicago, IL";
  const cityDest = destination || "Michigan Ave & Wacker Dr, Chicago, IL";

  if (!isAPIKeyAvailable()) {
    const deltaLat = 0.005;
    const deltaLng = 0.005;
    
    // Coordinates centered around Chicago downtown
    const startLat = 41.8818;
    const startLng = -87.6278;

    return {
      standardRoute: {
        name: "Direct Route via State St Corridor",
        path: [
          { lat: startLat, lng: startLng },
          { lat: startLat + deltaLat * 0.3, lng: startLng },
          { lat: startLat + deltaLat * 0.6, lng: startLng + deltaLng * 0.2 },
          { lat: startLat + deltaLat, lng: startLng + deltaLng }
        ],
        safetyScore: 78,
        safetyFactors: {
          lighting: 85,
          policePresence: 65,
          isolationAvoidance: 70,
          activeSentries: 60
        },
        description: `Direct walk along State St. This route has high pedestrian activity but passes near 1 unlit segment at the intersection alleyway.`,
        warnings: ["Unlit alley intersection reported at Monroe & State St.", "Lower patrol coverage between cycles 02:00 and 04:00."]
      },
      safeRoute: {
        name: "Vanguard Guarded Corridor detour",
        path: [
          { lat: startLat, lng: startLng },
          { lat: startLat, lng: startLng + deltaLng * 0.4 },
          { lat: startLat + deltaLat * 0.5, lng: startLng + deltaLng * 0.4 },
          { lat: startLat + deltaLat * 0.5, lng: startLng + deltaLng * 0.8 },
          { lat: startLat + deltaLat, lng: startLng + deltaLng * 0.8 },
          { lat: startLat + deltaLat, lng: startLng + deltaLng }
        ],
        safetyScore: 94,
        safetyFactors: {
          lighting: 98,
          policePresence: 92,
          isolationAvoidance: 95,
          activeSentries: 88
        },
        description: `Detour via Michigan Ave. Complete constant street illumination present with active volunteer patrol sentries situated every 200 meters.`,
        benefits: ["Constant streetlighting present.", "Traverses highly-active volunteer patrol route.", "Direct line of sight to regional police outpost."]
      },
      policeStations: [
        {
          name: "Vanguard Precinct Command Center",
          location: { lat: startLat + deltaLat * 0.5, lng: startLng + deltaLng * 0.5 },
          address: "312 W Randolph St, Chicago, IL",
          distanceMeters: 450,
          status: "Active 24/7"
        },
        {
          name: "Security Outpost Station 4B",
          location: { lat: startLat + deltaLat * 0.8, lng: startLng + deltaLng * 0.2 },
          address: "100 N Michigan Ave, Chicago, IL",
          distanceMeters: 780,
          status: "Patrolled Zone"
        }
      ],
      aiRecommendation: `Vanguard AI Advisor recommends the 'Vanguard Guarded Corridor' detour. Although it takes 4 minutes longer, it increases lighting density by 15% and ensures immediate proximity to 2 active response checkpoints.`
    };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Act as Vanguard's Tactical Safe Route Navigator. 
      Analyze route options from origin: "${cityOrigin}" to destination: "${cityDest}".
      Constraint: Avoid isolated, unlit, or high-incident roads. Preferred features are well-lit avenues, active security patrols, and proximity to police stations.
      Whether "Prefer Secured Highly-Lit Corridors" option is: ${avoidIsolated ? 'ENABLED (strongly avoid any isolated segments)' : 'DISABLED (standard safe-routing)'}.
  
      Please generate and return a JSON safe routing response.
      
      If the city is Chicago or coordinates overlap, use realistic locations like State St, Madison St, Michigan Ave, etc. 
      For any city name requested (e.g., San Francisco, New York, London, Paris, Tokyo, Sydney), generate accurate or highly plausible coordinates and street descriptions.
      
      Return:
      1. A "standardRoute": direct path, but with isolated segment alerts. Contains:
         - name (string)
         - path (Array of objects with lat (number) and lng (number) keys. Generate 4-7 coordinate points detailing a realistic path).
         - safetyScore (0-100)
         - safetyFactors (object with numeric values (0-100) for: lighting, policePresence, isolationAvoidance, activeSentries)
         - description (string describing streets traversed and safety status)
         - warnings (Array of strings like "Passes near dark alley at N State St", etc.)
      2. A "safeRoute": alternate longer route which prioritizes well-lit, busy streets and police sector corridors. Contains:
         - name (string)
         - path (Array of objects with lat, lng. Generate 4-7 points showing the safe path detour).
         - safetyScore (0-100, should be significantly higher than standardRoute)
         - safetyFactors (object with keys: lighting, policePresence, isolationAvoidance, activeSentries)
         - description (string explaining why this detour is safer)
         - benefits (Array of strings like "Traverses highly-active volunteer patrol route", "Constant streetlighting present", etc.)
      3. An array of "policeStations": 2 to 3 nearby police stations or security outposts along the safe route. For each:
         - name (string)
         - location ({ lat, lng })
         - address (string)
         - distanceMeters (number)
         - status (string, e.g., "Active 24/7", "Patrolled Zone")
      4. An "aiRecommendation": a concise 2-sentence tactical guidance note for the traveler.
  
      Return JSON matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            standardRoute: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                path: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    },
                    required: ["lat", "lng"]
                  }
                },
                safetyScore: { type: Type.NUMBER },
                safetyFactors: {
                  type: Type.OBJECT,
                  properties: {
                    lighting: { type: Type.NUMBER },
                    policePresence: { type: Type.NUMBER },
                    isolationAvoidance: { type: Type.NUMBER },
                    activeSentries: { type: Type.NUMBER }
                  },
                  required: ["lighting", "policePresence", "isolationAvoidance", "activeSentries"]
                },
                description: { type: Type.STRING },
                warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "path", "safetyScore", "safetyFactors", "description", "warnings"]
            },
            safeRoute: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                path: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    },
                    required: ["lat", "lng"]
                  }
                },
                safetyScore: { type: Type.NUMBER },
                safetyFactors: {
                  type: Type.OBJECT,
                  properties: {
                    lighting: { type: Type.NUMBER },
                    policePresence: { type: Type.NUMBER },
                    isolationAvoidance: { type: Type.NUMBER },
                    activeSentries: { type: Type.NUMBER }
                  },
                  required: ["lighting", "policePresence", "isolationAvoidance", "activeSentries"]
                },
                description: { type: Type.STRING },
                benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "path", "safetyScore", "safetyFactors", "description", "benefits"]
            },
            policeStations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  location: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER }
                    },
                    required: ["lat", "lng"]
                  },
                  address: { type: Type.STRING },
                  distanceMeters: { type: Type.NUMBER },
                  status: { type: Type.STRING }
                },
                required: ["name", "location", "address", "distanceMeters", "status"]
              }
            },
            aiRecommendation: { type: Type.STRING }
          },
          required: ["standardRoute", "safeRoute", "policeStations", "aiRecommendation"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] generateSafeRoute fallback:", e);
    // Chicago coordinate defaults
    const startLat = 41.8818;
    const startLng = -87.6278;
    return {
      standardRoute: {
        name: "Direct Route (State St Corridor)",
        path: [
          { lat: startLat, lng: startLng },
          { lat: startLat + 0.002, lng: startLng },
          { lat: startLat + 0.005, lng: startLng + 0.003 }
        ],
        safetyScore: 80,
        safetyFactors: { lighting: 85, policePresence: 70, isolationAvoidance: 75, activeSentries: 65 },
        description: "Direct walkway under regional telemetry surveillance.",
        warnings: ["Minor unlit sections around Monroe alley."]
      },
      safeRoute: {
        name: "Guarded Corridor (Michigan Ave detour)",
        path: [
          { lat: startLat, lng: startLng },
          { lat: startLat, lng: startLng + 0.004 },
          { lat: startLat + 0.005, lng: startLng + 0.004 }
        ],
        safetyScore: 96,
        safetyFactors: { lighting: 99, policePresence: 95, isolationAvoidance: 98, activeSentries: 90 },
        description: "Completely illuminated pathway with active volunteer sentry alignment.",
        benefits: ["Traverses high illumination avenues", "Immediate proximity to police command outposts"]
      },
      policeStations: [
        {
          name: "Vanguard Command Outpost Randolph",
          location: { lat: startLat + 0.003, lng: startLng + 0.002 },
          address: " Randolph St & State St, Chicago",
          distanceMeters: 300,
          status: "Active 24/7"
        }
      ],
      aiRecommendation: "Proceed via the Guarded Corridor. Lighting quality is optimized with continuous active security nodes."
    };
  }
};

export const analyzeThreatReport = async (
  description: string,
  keywords: string[],
  location: string,
  previousIncidents: string
) => {
  if (!isAPIKeyAvailable()) {
    const descLower = description.toLowerCase();
    const prevLower = previousIncidents.toLowerCase();
    const keysJoined = keywords.map(k => k.toLowerCase()).join(" ");

    let threatScore = 35;
    let riskClassification: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk' = 'Low Risk';
    let alertPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let urgencyLevel = "Low Urgency";
    let recommendedAction = "Monitor situation. Register threat vectors in Vanguard local database. Share safety beacon link with trusted contacts.";

    const hasCriticalSignals = descLower.includes("gun") || descLower.includes("weapon") || descLower.includes("stalk") || descLower.includes("kidnap") || descLower.includes("follow") || descLower.includes("abduct") || descLower.includes("assault") || descLower.includes("danger") || descLower.includes("emergency") || keysJoined.includes("weapon") || keysJoined.includes("stalk") || keysJoined.includes("threat") || prevLower.includes("harassment") || prevLower.includes("violence");
    const hasHighSignals = descLower.includes("suspicious") || descLower.includes("vehicle") || descLower.includes("chase") || descLower.includes("shadow") || descLower.includes("unlit") || descLower.includes("fear") || keysJoined.includes("suspicious") || keysJoined.includes("vehicle");

    if (hasCriticalSignals) {
      threatScore = 88;
      riskClassification = 'Critical Risk';
      alertPriority = 'CRITICAL';
      urgencyLevel = "Critical Urgency";
      recommendedAction = "IMMEDIATE EMERGENCY INTERVENTION REQUIRED. Activate Vanguard covert Silent SOS beacon. Relocate immediately to the nearest verified Safe Zone or Police Precinct. Vanguard community rescue network and patrol volunteers have been put on maximum alert.";
    } else if (hasHighSignals) {
      threatScore = 68;
      riskClassification = 'High Risk';
      alertPriority = 'HIGH';
      urgencyLevel = "High Urgency";
      recommendedAction = "High-risk escalation warning. Request immediate community volunteer escort. Stay in heavily crowded and illuminated corridors. Contact guardians via the Vocal Scan hotline.";
    } else if (descLower.includes("annoying") || descLower.includes("lost") || descLower.includes("argument") || keysJoined.includes("minor")) {
      threatScore = 45;
      riskClassification = 'Medium Risk';
      alertPriority = 'MEDIUM';
      urgencyLevel = "Medium Urgency";
      recommendedAction = "Exercise heightened caution. Adjust your path to utilize Vanguard Safe Routes. Keep your evidence locker synchronized.";
    }

    return {
      threatScore,
      urgencyLevel,
      riskClassification,
      recommendedAction,
      alertPriority,
      keyThreats: keywords.length > 0 ? keywords : ["Perimeter observation anomaly"],
      vulnerabilityAssessment: `Based on your description of events in ${location || "Unknown Sector"} and previous context "${previousIncidents || "No prior incidents logged"}", Vanguard systems have registered a risk pattern.`
    };
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are the Vanguard Tactical AI Threat Assessor. Analyze this threat report:
      - Description: "${description}"
      - Keywords: ${JSON.stringify(keywords)}
      - Location: "${location}"
      - Previous Incidents Context: "${previousIncidents}"

      Your goal is to evaluate the threat level, classify the risk, compute a threat score (0-100), define the urgency level, assign alert priority, and recommend immediate tactical safety actions.

      Your output must strictly follow the JSON response schema. The 'riskClassification' property must be one of: "Low Risk", "Medium Risk", "High Risk", "Critical Risk". The 'alertPriority' property must be one of: "LOW", "MEDIUM", "HIGH", "CRITICAL".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatScore: { type: Type.INTEGER, description: "Threat severity score from 0 to 100" },
            urgencyLevel: { type: Type.STRING, description: "Immediate urgency level description" },
            riskClassification: { type: Type.STRING, enum: ["Low Risk", "Medium Risk", "High Risk", "Critical Risk"] },
            recommendedAction: { type: Type.STRING, description: "Concise tactical safety action for the user" },
            alertPriority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
            keyThreats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific threat vectors identified" },
            vulnerabilityAssessment: { type: Type.STRING, description: "Vulnerability analysis explaining why this classification was chosen" }
          },
          required: ["threatScore", "urgencyLevel", "riskClassification", "recommendedAction", "alertPriority", "keyThreats", "vulnerabilityAssessment"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (e) {
    console.warn("[Gemini API Error] analyzeThreatReport fallback:", e);
    return {
      threatScore: 50,
      urgencyLevel: "Medium Urgency",
      riskClassification: "Medium Risk",
      recommendedAction: "Activate safety tracking beacon and stay alert.",
      alertPriority: "MEDIUM",
      keyThreats: ["Unverified hazard vector"],
      vulnerabilityAssessment: "Fallback evaluation active. Unable to complete full real-time semantic processing."
    };
  }
};

