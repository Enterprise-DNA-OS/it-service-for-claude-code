-- Operational service records. Use a database owner connection only in a trusted operator session.
create function stamp_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table services (id uuid primary key default gen_random_uuid(), reference text not null, name text not null, owner text not null default '', criticality text not null default 'normal' check(criticality in ('normal','critical')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger services_updated before update on services for each row execute function stamp_updated();
alter table services enable row level security;
revoke all on services from public;
create unique index services_reference on services(lower(reference));
create table assets (id uuid primary key default gen_random_uuid(), reference text not null, name text not null, service_id uuid references services(id), custodian text not null default '', status text not null default 'in-use' check(status in ('in-use','spare','retired')), warranty_on date, review_on date, disposal_evidence text not null default '' , created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger assets_updated before update on assets for each row execute function stamp_updated();
alter table assets enable row level security;
revoke all on assets from public;
create unique index assets_reference on assets(lower(reference));
create table problems (id uuid primary key default gen_random_uuid(), reference text not null, name text not null, service_id uuid references services(id), owner text not null default '', status text not null default 'open' check(status in ('open','known-error','resolved')), root_cause text not null default '', workaround text not null default '', resolution text not null default '' , created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger problems_updated before update on problems for each row execute function stamp_updated();
alter table problems enable row level security;
revoke all on problems from public;
create unique index problems_reference on problems(lower(reference));
create table tickets (id uuid primary key default gen_random_uuid(), reference text not null, name text not null, requester text not null default '', owner text not null default '', service_id uuid references services(id), asset_id uuid references assets(id), problem_id uuid references problems(id), type text not null default 'incident' check(type in ('incident','service-request')), priority text not null default 'medium' check(priority in ('low','medium','high','urgent')), status text not null default 'open' check(status in ('open','pending','resolved','closed')), opened_at timestamptz not null default now(), touched_at timestamptz not null default now(), response_due timestamptz, resolve_due timestamptz, responded_at timestamptz, resolved_at timestamptz, resolution text not null default '', contains_personal boolean not null default true, retention_review_on date, retention_basis text not null default '', legal_hold text not null default '', source_id text unique, source_row jsonb, source_hash text,
check(response_due is null or response_due >= opened_at), check(resolve_due is null or resolve_due >= opened_at), check(responded_at is null or responded_at >= opened_at), check(resolved_at is null or resolved_at >= opened_at), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger tickets_updated before update on tickets for each row execute function stamp_updated();
alter table tickets enable row level security;
revoke all on tickets from public;
create unique index tickets_reference on tickets(lower(reference));
create table changes (id uuid primary key default gen_random_uuid(), reference text not null, name text not null, service_id uuid references services(id), owner text not null, risk text not null check(risk in ('low','medium','high')), scheduled_at timestamptz not null, plan text not null, rollback text not null, evidence text not null default '', status text not null default 'draft' check(status in ('draft','approved','completed')), approved_by text not null default '', approval_note text not null default '', approved_at timestamptz, completed_at timestamptz, outcome text not null default '', check(status='draft' or (approved_by<>'' and approved_by<>owner and approved_at is not null)), check(status<>'completed' or (completed_at is not null and outcome<>'')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger changes_updated before update on changes for each row execute function stamp_updated();
alter table changes enable row level security;
revoke all on changes from public;
create unique index changes_reference on changes(lower(reference));
create table activity (id uuid primary key default gen_random_uuid(), entity_type text not null check(entity_type in ('tickets','assets','services','problems','changes')), entity_id uuid not null, actor text not null check(length(trim(actor))>0), action text not null, note text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger activity_updated before update on activity for each row execute function stamp_updated();
alter table activity enable row level security;
revoke all on activity from public;
create index ticket_asset on tickets(asset_id); create index ticket_problem on tickets(problem_id); create index activity_entity on activity(entity_type,entity_id,created_at);
create view ticket_queue as
select t.id,t.reference,t.name,t.priority,t.status,t.owner,coalesce(s.name,'Unassigned') as service,
coalesce(a.reference,'') as asset,coalesce(p.reference,'') as problem,t.response_due,t.resolve_due,
(t.responded_at is null and t.response_due < now() and t.status in ('open','pending')) as response_overdue,
(t.resolve_due < now() and t.status in ('open','pending')) as resolution_overdue,
floor(extract(epoch from (now()-t.touched_at))/86400)::int as quiet_days
from tickets t left join services s on s.id=t.service_id left join assets a on a.id=t.asset_id left join problems p on p.id=t.problem_id;
create view asset_risk as
select a.id,a.reference,a.name,a.custodian,a.status,a.warranty_on,a.review_on,coalesce(s.name,'Unassigned') as service,
count(t.id) filter(where t.status in ('open','pending'))::int as open_incidents,
count(t.id) filter(where t.status in ('open','pending') and t.resolve_due<now())::int as overdue_incidents
from assets a left join services s on s.id=a.service_id left join tickets t on t.asset_id=a.id and t.type='incident' group by a.id,s.name;
create view problem_review as
select p.id,p.reference,p.name,p.owner,p.status,p.root_cause,p.workaround,
count(t.id)::int as linked_tickets,count(t.id) filter(where t.status in ('open','pending'))::int as open_tickets
from problems p left join tickets t on t.problem_id=p.id group by p.id;
create view change_review as
select c.id,c.reference,c.name,c.owner,c.risk,c.status,c.scheduled_at,c.approved_by,coalesce(s.name,'Unassigned') as service,
count(t.id) filter(where t.status in ('open','pending'))::int as open_tickets
from changes c left join services s on s.id=c.service_id left join tickets t on t.service_id=c.service_id group by c.id,s.name;
create view service_health as
select s.id,s.reference,s.name,s.owner,s.criticality,count(t.id) filter(where t.status in ('open','pending'))::int as open_tickets,
count(t.id) filter(where t.status in ('open','pending') and t.resolve_due<now())::int as overdue_tickets
from services s left join tickets t on t.service_id=s.id group by s.id;
create view compliance_findings as
select reference,'NZ-IPP9' as rule,'Review personal-record retention purpose and date' as finding from tickets where contains_personal and (retention_review_on is null or retention_review_on<=current_date or trim(retention_basis)='')
union all select reference,'HOLD','Preserve record under hold: '||legal_hold from tickets where legal_hold<>''
union all select reference,'NZ-IPP5','Review asset custody or disposal evidence' from assets where (status='in-use' and trim(custodian)='') or (status='retired' and trim(disposal_evidence)='')
union all select reference,'POLICY-OWNER','Assign service owner' from services where trim(owner)=''
union all select reference,'POLICY-CHANGE','Change review needed before planned work' from changes where status='draft' and scheduled_at<=now()+interval '7 days'
union all select reference,'POLICY-DEADLINE','Confirm response and resolution deadlines' from tickets where status in ('open','pending') and (response_due is null or resolve_due is null)
union all select reference,'POLICY-CLOSURE','Imported resolved record lacks resolution evidence' from tickets where status in ('resolved','closed') and (resolved_at is null or trim(resolution)='');
revoke all on ticket_queue,asset_risk,problem_review,change_review,service_health,compliance_findings from public;
