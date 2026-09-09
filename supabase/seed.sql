insert into public.categories (id, name, slug) values
('10000000-0000-0000-0000-000000000001', 'Streamers', 'streamers'),
('10000000-0000-0000-0000-000000000002', 'Creadores', 'creadores'),
('10000000-0000-0000-0000-000000000003', 'Comunidades', 'comunidades')
on conflict (slug) do update set name = excluded.name;

insert into public.participants (id, name, slug, bio, category_id, verified) values
('20000000-0000-0000-0000-000000000001', 'Spreen', 'spreen', 'Una de las comunidades de streaming más grandes de Argentina, compitiendo para transformar alcance en impacto.', '10000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000002', 'Davo Xeneize', 'davo', 'Comunidad de fútbol y streaming unida para convertir competencia en alimento para refugios.', '10000000-0000-0000-0000-000000000002', true),
('20000000-0000-0000-0000-000000000003', 'Coscu', 'coscu', 'Una comunidad pionera del streaming argentino que lleva su competencia fuera de la pantalla.', '10000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000004', 'Momo', 'momo', 'Audiencia, entretenimiento y compromiso colectivo detrás de una meta concreta.', '10000000-0000-0000-0000-000000000002', true),
('20000000-0000-0000-0000-000000000005', 'Luquitas Rodríguez', 'luquitas-rodriguez', 'Una comunidad creativa que convierte cada aporte en alimento y movimiento en el ranking.', '10000000-0000-0000-0000-000000000003', false)
on conflict (slug) do update set name = excluded.name, bio = excluded.bio, category_id = excluded.category_id, verified = excluded.verified;

insert into public.donors (id, display_name) values
('30000000-0000-0000-0000-000000000001', 'Nicolás'),
('30000000-0000-0000-0000-000000000002', 'Lucio'),
('30000000-0000-0000-0000-000000000003', 'Martín'),
('30000000-0000-0000-0000-000000000004', 'Sofía')
on conflict (id) do update set display_name = excluded.display_name;

insert into public.donations (id, donor_id, participant_id, anonymous, impact_units, amount, status, created_at) values
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', false, 12000, 60000000, 'approved', now() - interval '20 days'),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', false, 480, 2400000, 'approved', now() - interval '2 hours'),
('40000000-0000-0000-0000-000000000003', null, '20000000-0000-0000-0000-000000000001', true, 2, 10000, 'approved', now() - interval '20 minutes'),
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', false, 12341, 61705000, 'approved', now() - interval '18 days'),
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', false, 10, 50000, 'approved', now() - interval '10 minutes'),
('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', false, 10221, 51105000, 'approved', now() - interval '12 days'),
('40000000-0000-0000-0000-000000000007', null, '20000000-0000-0000-0000-000000000004', true, 8904, 44520000, 'approved', now() - interval '10 days'),
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', false, 7610, 38050000, 'approved', now() - interval '8 days'),
('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000003', null, false, 5, 25000, 'approved', now() - interval '30 minutes'),
('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', false, 4, 20000, 'pending', now())
on conflict (id) do nothing;

insert into public.campaigns (id, slug, title, location, ngo_name, goal_amount, raised_amount, impact_goal, status, activity_date, delivery_date, excerpt, description, published_at) values
('50000000-0000-0000-0000-000000000001', 'alimento-refugios-tandil', 'Alimento para refugios de Tandil', 'Tandil, Buenos Aires', 'Refugio Huellas Tandil — dato ficticio de desarrollo', 1000000, 1000000, 1000, 'completed', '2026-08-22', '2026-08-22', 'La primera meta se convirtió en una entrega comunitaria de alimento.', 'Campaña ficticia de desarrollo: reunió aportes de distintas comunidades para comprar y entregar alimento a un refugio de prueba.', '2026-08-23T12:00:00Z'),
('50000000-0000-0000-0000-000000000002', 'alimento-refugios-cordoba', 'Alimento para refugios de Córdoba', 'Córdoba, Córdoba', 'Red de Refugios Córdoba — dato ficticio de desarrollo', 1500000, 620000, 1500, 'fundraising', null, null, 'Una campaña de desarrollo para apoyar la compra de alimento para perros.', 'Campaña ficticia de desarrollo: una meta abierta que agrupa aportes para una futura compra y entrega de alimento.', '2026-08-15T12:00:00Z'),
('50000000-0000-0000-0000-000000000003', 'ayuda-refugios-amba', 'Ayuda a refugios del AMBA', 'Área Metropolitana de Buenos Aires', 'Alianza Refugios AMBA — dato ficticio de desarrollo', 2000000, 2000000, 2000, 'goal_reached', null, null, 'La meta está completa y comienza la coordinación de la compra.', 'Campaña ficticia de desarrollo orientada a financiar alimento y coordinar su entrega entre refugios de prueba.', '2026-08-22T12:00:00Z')
on conflict (slug) do update set title = excluded.title, status = excluded.status, raised_amount = excluded.raised_amount;

insert into public.campaign_updates (id, campaign_id, title, content, event_date) values
('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Campaña iniciada', 'Publicamos la meta y la organización participante.', '2026-06-01'),
('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '50% de la meta alcanzada', 'Las comunidades financiaron la mitad del objetivo.', '2026-06-20'),
('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'Meta cumplida', 'Se completó el objetivo previsto.', '2026-06-30'),
('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'Compra de alimento', 'Se adquirieron 1.000 kg de alimento para la entrega.', '2026-08-20'),
('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000002', 'Campaña iniciada', 'Comenzó la recaudación del objetivo.', '2026-08-15'),
('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000003', 'Meta cumplida', 'Comenzó la coordinación de compra y distribución.', '2026-08-22'),
('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000001', 'Entrega realizada', 'El alimento fue entregado al refugio participante.', '2026-08-22')
on conflict (id) do nothing;

insert into public.campaign_evidence (id, campaign_id, type, label, url, evidence_date) values
('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'photo', 'Registro fotográfico de la entrega — evidencia ficticia de desarrollo', null, '2026-08-22'),
('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'receipt', 'Factura de compra de alimento — evidencia ficticia de desarrollo', null, '2026-08-20'),
('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', 'document', 'Plan de distribución — evidencia ficticia de desarrollo', null, '2026-08-22')
on conflict (id) do nothing;
