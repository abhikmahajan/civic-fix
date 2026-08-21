export const testCases = [
  {
    id: 'TC-001',
    name: 'Clear pothole image',
    category: 'classification',
    input: {
      description: 'There is a big pothole on the main road near C Block',
      imageDescription: 'Photo shows a large pothole on an asphalt road with water accumulated',
      location: { latitude: '28.6100', longitude: '77.2100' }
    },
    expected: {
      problem_type: 'pothole',
      severity: 'high',
      department: 'road_maintenance'
    }
  },
  {
    id: 'TC-002',
    name: 'Garbage dump',
    category: 'classification',
    input: {
      description: 'huge pile of garbage not cleared for days',
      imageDescription: 'Overflowing garbage bin spilling onto the sidewalk',
      location: { latitude: '28.6110', longitude: '77.2110' }
    },
    expected: {
      problem_type: 'garbage',
      severity: 'medium',
      department: 'sanitation'
    }
  },
  {
    id: 'TC-003',
    name: 'Broken streetlight',
    category: 'classification',
    input: {
      description: 'Streetlight is broken and the street is pitch dark',
      imageDescription: 'Dark street with a non-functioning streetlight pole visible',
      location: { latitude: '28.6120', longitude: '77.2120' }
    },
    expected: {
      problem_type: 'streetlight',
      severity: 'medium',
      department: 'electricity'
    }
  },
  {
    id: 'TC-004',
    name: 'Water supply leak',
    category: 'classification',
    input: {
      description: 'Water pipe leaking heavily on the street',
      imageDescription: 'Water gushing out of a broken pipe on the side of the road',
      location: { latitude: '28.6130', longitude: '77.2130' }
    },
    expected: {
      problem_type: 'water_leak',
      severity: 'high',
      department: 'water_supply'
    }
  },
  {
    id: 'TC-005',
    name: 'Ambiguous request',
    category: 'classification',
    input: {
      description: 'This is a mess, someone please fix it',
      imageDescription: 'Unclear image showing both some trash and a cracked pavement',
      location: { latitude: '28.6140', longitude: '77.2140' }
    },
    expected: {
      problem_type: 'ambiguous',
      severity: 'low',
      department: 'general'
    }
  },
  {
    id: 'TC-006',
    name: 'Critical severity',
    category: 'severity',
    input: {
      description: 'Live wire fallen on the street, very dangerous',
      imageDescription: 'Sparking electrical wire lying on a wet road',
      location: { latitude: '28.6150', longitude: '77.2150' }
    },
    expected: {
      problem_type: 'electrical_hazard',
      severity: 'critical',
      department: 'electricity'
    }
  },
  {
    id: 'TC-007',
    name: 'High severity',
    category: 'severity',
    input: {
      description: 'Sewer overflowing into houses',
      imageDescription: 'Dirty water covering the street and entering doorsteps',
      location: { latitude: '28.6160', longitude: '77.2160' }
    },
    expected: {
      problem_type: 'sewer',
      severity: 'high',
      department: 'sanitation'
    }
  },
  {
    id: 'TC-008',
    name: 'Low severity',
    category: 'severity',
    input: {
      description: 'Small crack on the walking path',
      imageDescription: 'Minor crack on pavement, not causing obstruction',
      location: { latitude: '28.6170', longitude: '77.2170' }
    },
    expected: {
      problem_type: 'pavement',
      severity: 'low',
      department: 'road_maintenance'
    }
  },
  {
    id: 'TC-009',
    name: 'Medium severity',
    category: 'severity',
    input: {
      description: 'Fallen tree branch blocking one side of the road',
      imageDescription: 'Tree branch on the edge of the road, cars passing by slowly',
      location: { latitude: '28.6180', longitude: '77.2180' }
    },
    expected: {
      problem_type: 'fallen_tree',
      severity: 'medium',
      department: 'parks'
    }
  },
  {
    id: 'TC-010',
    name: 'Parks department routing',
    category: 'department',
    input: {
      description: 'Swings in the public park are broken',
      imageDescription: 'Broken chains on a children swing set in a park',
      location: { latitude: '28.6190', longitude: '77.2190' }
    },
    expected: {
      problem_type: 'broken_equipment',
      severity: 'low',
      department: 'parks'
    }
  },
  {
    id: 'TC-011',
    name: 'Traffic department routing',
    category: 'department',
    input: {
      description: 'Traffic light at intersection not working',
      imageDescription: 'Traffic signal completely turned off, chaotic traffic',
      location: { latitude: '28.6200', longitude: '77.2200' }
    },
    expected: {
      problem_type: 'traffic_light',
      severity: 'high',
      department: 'traffic'
    }
  },
  {
    id: 'TC-012',
    name: 'Animal control routing',
    category: 'department',
    input: {
      description: 'Aggressive stray dogs chasing people',
      imageDescription: 'Pack of dogs aggressively barking at pedestrians',
      location: { latitude: '28.6210', longitude: '77.2210' }
    },
    expected: {
      problem_type: 'stray_animals',
      severity: 'medium',
      department: 'animal_control'
    }
  },
  {
    id: 'TC-013',
    name: 'Conflict detection - Duplicate',
    category: 'conflict',
    input: {
      description: 'Big pothole here',
      imageDescription: 'Pothole on the road',
      location: { latitude: '28.6100', longitude: '77.2100' },
      historicalContext: [{ problem_type: 'pothole', status: 'pending', distance_meters: 5 }]
    },
    expected: {
      conflict_detected: true,
      conflict_type: 'duplicate'
    }
  },
  {
    id: 'TC-014',
    name: 'Conflict detection - False Alarm',
    category: 'conflict',
    input: {
      description: 'Another issue nearby',
      imageDescription: 'Garbage dump',
      location: { latitude: '28.6105', longitude: '77.2105' },
      historicalContext: [{ problem_type: 'streetlight', status: 'pending', distance_meters: 10 }]
    },
    expected: {
      conflict_detected: false,
      conflict_type: 'none'
    }
  },
  {
    id: 'TC-015',
    name: 'Conflict detection - Different Issue',
    category: 'conflict',
    input: {
      description: 'Water leak',
      imageDescription: 'Leaking pipe',
      location: { latitude: '28.6100', longitude: '77.2100' },
      historicalContext: [{ problem_type: 'pothole', status: 'resolved', distance_meters: 2 }]
    },
    expected: {
      conflict_detected: false,
      conflict_type: 'none'
    }
  },
  {
    id: 'TC-016',
    name: 'Resolution - Resolved',
    category: 'resolution',
    input: {
      description: 'Pothole is gone',
      imageDescription: 'Freshly patched asphalt road',
      location: { latitude: '28.6100', longitude: '77.2100' }
    },
    expected: {
      status_update: 'resolved'
    }
  },
  {
    id: 'TC-017',
    name: 'Resolution - Not Resolved',
    category: 'resolution',
    input: {
      description: 'Pothole is still there',
      imageDescription: 'Pothole on the road',
      location: { latitude: '28.6100', longitude: '77.2100' }
    },
    expected: {
      status_update: 'pending'
    }
  },
  {
    id: 'TC-018',
    name: 'Resolution - Ambiguous',
    category: 'resolution',
    input: {
      description: 'Cannot tell',
      imageDescription: 'Dark blurred image',
      location: { latitude: '28.6100', longitude: '77.2100' }
    },
    expected: {
      status_update: 'needs_human_review'
    }
  },
  {
    id: 'TC-019',
    name: 'Edge case - Bad image',
    category: 'classification',
    input: {
      description: 'Issue here',
      imageDescription: 'completely black or blurred image',
      location: { latitude: '28.6100', longitude: '77.2100' }
    },
    expected: {
      problem_type: 'unknown',
      severity: 'low',
      department: 'general'
    }
  },
  {
    id: 'TC-020',
    name: 'Edge case - Hindi description',
    category: 'classification',
    input: {
      description: 'यहाँ बहुत सारा कचरा है',
      imageDescription: 'Garbage dump',
      location: { latitude: '28.6100', longitude: '77.2100' }
    },
    expected: {
      problem_type: 'garbage',
      severity: 'medium',
      department: 'sanitation'
    }
  }
];
