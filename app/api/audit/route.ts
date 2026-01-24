import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, getAuditUsers, getAuditReportSlugs } from '@/lib/auditStorage';
import { AuditLogFilter, AuditActionType, AuditStatus } from '@/lib/auditTypes';
import { getSession, SESSION_COOKIE_NAME, isAuthEnabled } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (isAuthEnabled()) {
      const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!sessionId) {
        return NextResponse.json(
          { ok: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      const session = getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { ok: false, error: 'Invalid session' },
          { status: 401 }
        );
      }
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Check if requesting meta info (users, report slugs)
    const meta = searchParams.get('meta');
    if (meta === 'users') {
      const users = await getAuditUsers();
      return NextResponse.json({ ok: true, users });
    }
    if (meta === 'report_slugs') {
      const reportSlugs = await getAuditReportSlugs();
      return NextResponse.json({ ok: true, reportSlugs });
    }

    // Build filter from query params
    const filter: AuditLogFilter = {};
    
    const action_type = searchParams.get('action_type');
    if (action_type) {
      filter.action_type = action_type as AuditActionType;
    }
    
    const user_email = searchParams.get('user_email');
    if (user_email) {
      filter.user_email = user_email;
    }
    
    const report_slug = searchParams.get('report_slug');
    if (report_slug) {
      filter.report_slug = report_slug;
    }
    
    const status = searchParams.get('status');
    if (status) {
      filter.status = status as AuditStatus;
    }
    
    const date_from = searchParams.get('date_from');
    if (date_from) {
      filter.date_from = date_from;
    }
    
    const date_to = searchParams.get('date_to');
    if (date_to) {
      filter.date_to = date_to;
    }
    
    const limit = searchParams.get('limit');
    if (limit) {
      filter.limit = parseInt(limit, 10);
    } else {
      filter.limit = 100; // Default limit
    }
    
    const offset = searchParams.get('offset');
    if (offset) {
      filter.offset = parseInt(offset, 10);
    }

    const logs = await getAuditLogs(filter);
    return NextResponse.json({ ok: true, logs });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
