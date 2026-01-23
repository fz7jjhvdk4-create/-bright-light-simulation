import { NextRequest, NextResponse } from 'next/server';

const ROLES: Record<string, {
  name: string;
  title: string;
  personality: string;
  knowledge: string[];
  stance: string;
}> = {
  maria: {
    name: 'Maria Lindberg',
    title: 'VD',
    personality: 'Professionell, resultatfokuserad, lite stressad över situationen',
    knowledge: [
      'Reklamationerna har ökat från 412 till 847 på ett år (106%)',
      'Kostnaderna har gått från 2,1 till 4,8 MSEK',
      'Styrelsen kräver 50% reduktion inom 12 månader',
      'Budget för förbättringsprojekt: 800 000 SEK'
    ],
    stance: 'stödjande'
  },
  karin: {
    name: 'Karin Ström',
    title: 'Kvalitetschef',
    personality: 'Analytisk, datadriven, frustrerad över att inte hittat lösningen',
    knowledge: [
      'Har detaljerad reklamationsdata i Excel',
      'Ser mönster: kvällsskiftet står för 60% av felen',
      'Misstänker att det finns koppling till leverantörsbyte',
      'Kan dela reklamationsdata, leverantörsdata och skiftdata'
    ],
    stance: 'stödjande'
  },
  thomas: {
    name: 'Thomas Berg',
    title: 'Inköpschef',
    personality: 'Defensiv, kostnadsfokuserad, vill inte erkänna misstag',
    knowledge: [
      'Bytte till AsiaCore-drivdon för 18 månader sedan för att spara 15%',
      'Har sett mejl om kvalitetsproblem men ignorerat dem',
      'AsiaCore har MTBF på 35 000h istället för 50 000h',
      'Vill inte gå tillbaka till dyrare leverantör'
    ],
    stance: 'motståndare'
  },
  mikael: {
    name: 'Mikael Svensson',
    title: 'Produktionschef',
    personality: 'Praktisk, lösningsorienterad, skyddar sitt team',
    knowledge: [
      'Utbildningen på nya JUKI-maskiner var bara 2 halvdagar',
      'Kvällsskiftet fick ingen utbildning alls',
      'Har märkt att dagskiftet gör färre fel',
      'Behöver mer resurser för ordentlig upplärning'
    ],
    stance: 'skeptisk'
  },
  peter: {
    name: 'Peter Nilsson',
    title: 'HR-chef',
    personality: 'Empatisk, orolig för personalen, ser kulturproblem',
    knowledge: [
      'Personalomsättningen på kvällsskiftet är 35%',
      'Många nyanställda får bara 2 veckors introduktion',
      'Det finns spänningar mellan skiften',
      'Har försökt få budget för bättre onboarding'
    ],
    stance: 'stödjande'
  },
  kenneth: {
    name: 'Kenneth Ek',
    title: 'Operatör, dagskift',
    personality: 'Erfaren, stolt över sitt arbete, lite nedlåtande mot kvällsskiftet',
    knowledge: [
      'Har jobbat i 12 år och kan maskinerna utan och innan',
      'Dagskiftet har sina egna knep som de lärt sig över tid',
      'Tycker kvällsskiftet slarvar',
      'Vet att överlämningen mellan skiften är dålig'
    ],
    stance: 'skeptisk'
  },
  emma: {
    name: 'Emma Lindqvist',
    title: 'Operatör, kvällsskift',
    personality: 'Frustrerad, känner sig orättvist behandlad, vill göra bra ifrån sig',
    knowledge: [
      'Fick bara 2 veckors upplärning',
      'Dagskiftet delar inte med sig av sina kunskaper',
      'Skiftloggen är ofta tom eller oläslig',
      'Många på kvällsskiftet är nya och osäkra'
    ],
    stance: 'stödjande'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { messages, roleId } = await request.json();
    
    const role = ROLES[roleId];
    if (!role) {
      return NextResponse.json({ error: 'Okänd roll' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY saknas');
      return NextResponse.json({ error: 'API-konfiguration saknas' }, { status: 500 });
    }

    const systemPrompt = `Du är ${role.name}, ${role.title} på Bright Light Solutions AB.

PERSONLIGHET: ${role.personality}

DIN KUNSKAP:
${role.knowledge.map(k => `- ${k}`).join('\n')}

REGLER:
- Svara kort (2-4 meningar)
- Stance: ${role.stance}
- Avslöja information gradvis
- Prata svenska

KONTEXT: Reklamationer ökat 106%, kostnader 4,8 MSEK, mål 50% reduktion.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.slice(-10)
      })
    });

    if (!response.ok) {
      console.error('API error:', response.status);
      return NextResponse.json({ error: 'AI-fel' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({
      content: data.content[0]?.text || 'Inget svar.',
      role: 'assistant'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 });
  }
}
