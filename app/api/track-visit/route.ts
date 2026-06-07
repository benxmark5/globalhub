import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BOTS = [
  'googlebot','bingbot','slurp','duckduckbot','baiduspider',
  'yandexbot','facebookexternalhit','twitterbot','linkedinbot',
  'python-','curl/','wget','scrapy','postman',
];

const isBot = (ua: string) => BOTS.some(b => ua.toLowerCase().includes(b));
const getDevice = (ua: string) => /mobile|android|iphone/i.test(ua) ? 'mobile' : /ipad|tablet/i.test(ua) ? 'tablet' : 'desktop';
const getBrowser = (ua: string) => ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Other';
const getOS = (ua: string) => ua.includes('Windows') ? 'Windows' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : 'Other';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitor_id, page, referrer, country, city, currency, flag } = body;
    const ua = req.headers.get('user-agent') || '';

    if (isBot(ua)) {
      return NextResponse.json({ tracked: false, reason: 'bot' });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const thirtyAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from('website_visits')
      .select('id')
      .eq('visitor_id', visitor_id)
      .eq('page', page)
      .gte('created_at', thirtyAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json({ tracked: false, reason: 'duplicate' });
    }

    const { data: prev } = await supabase
      .from('website_visits')
      .select('id')
      .eq('visitor_id', visitor_id)
      .limit(1);

    const isNew = !prev || prev.length === 0;

    await supabase.from('website_visits').insert({
      visitor_id,
      country: country || 'Unknown',
      city: city || 'Unknown',
      device: getDevice(ua),
      browser: getBrowser(ua),
      os: getOS(ua),
      page: page || '/',
      referrer: referrer || 'direct',
      currency: currency || 'USD',
      is_new_visitor: isNew,
    });

    await supabase.from('activity_feed').insert({
      type: 'visit',
      title: `${flag || '🌍'} Visitor from ${country || 'Unknown'}`,
      description: `Browsing ${page || '/'}${isNew ? ' · New visitor' : ''}`,
      country: country || 'Unknown',
      country_flag: flag || '🌍',
      metadata: { device: getDevice(ua), browser: getBrowser(ua), page, is_new: isNew }
    });

    return NextResponse.json({ tracked: true, isNew });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json({ tracked: false });
  }
}