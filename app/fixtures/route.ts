export async function GET() {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Using TheSportsDB free API
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&s=Soccer`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return Response.json({ data: [] });
    }

    const raw = await res.json();
    const events = raw.events || [];

    // Transform to our format
    const matches = events.map((e: {
      idEvent: string;
      strLeague: string;
      strHomeTeam: string;
      strAwayTeam: string;
      strTimestamp: string;
      strStatus: string;
    }) => ({
      id: e.idEvent,
      league: { name: e.strLeague },
      participants: [
        { id: 1, name: e.strHomeTeam },
        { id: 2, name: e.strAwayTeam },
      ],
      starting_at: e.strTimestamp,
      status: e.strStatus === 'Not Started' ? 'NS'
        : e.strStatus === 'In Progress' ? '1H'
        : e.strStatus || 'NS',
    }));

    return Response.json({ data: matches });

  } catch (error) {
    console.error('Fixtures error:', error);
    return Response.json({ data: [] });
  }
}