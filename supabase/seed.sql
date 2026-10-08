insert into services(id,reference,name,owner,criticality) values
('10000000-0000-0000-0000-000000000001','S-1','Harbour identity','Aroha','critical'),
('10000000-0000-0000-0000-000000000002','S-2','Harbour printing','','normal') on conflict do nothing;
insert into assets(id,reference,name,service_id,custodian,warranty_on,review_on) values
('20000000-0000-0000-0000-000000000001','A-1','Reception laptop','10000000-0000-0000-0000-000000000001','',current_date-20,current_date-2),
('20000000-0000-0000-0000-000000000002','A-2','Finance laptop','10000000-0000-0000-0000-000000000001','Moana',current_date+120,current_date+30) on conflict do nothing;
insert into problems(id,reference,name,service_id,owner,workaround) values
('30000000-0000-0000-0000-000000000001','P-1','Repeated identity timeouts','10000000-0000-0000-0000-000000000001','Lee','Use an approved spare device') on conflict do nothing;
insert into tickets(id,reference,name,requester,owner,service_id,asset_id,problem_id,priority,opened_at,touched_at,response_due,resolve_due,retention_review_on,retention_basis) values
('40000000-0000-0000-0000-000000000001','T-1','Harbour login failure','Casey','Aroha','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','urgent',now()-interval '20 days',now()-interval '15 days',now()-interval '19 days',now()-interval '18 days',current_date-1,'Support follow-up'),
('40000000-0000-0000-0000-000000000002','T-2','Harbour login intermittently slow','Moana','Lee','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','high',now()-interval '2 days',now()-interval '1 day',now()+interval '1 day',now()+interval '2 days',current_date+90,'Active support'),
('40000000-0000-0000-0000-000000000003','T-3','Printer onboarding request','Riley','','10000000-0000-0000-0000-000000000002',null,null,'low',now()-interval '1 day',now(),null,null,null,'') on conflict do nothing;
insert into changes(id,reference,name,service_id,owner,risk,scheduled_at,plan,rollback,evidence) values
('50000000-0000-0000-0000-000000000001','C-1','Identity configuration revision','10000000-0000-0000-0000-000000000001','Lee','high',now()+interval '2 days','Apply reviewed identity configuration','Restore saved configuration','archive://test/identity-1') on conflict do nothing;
