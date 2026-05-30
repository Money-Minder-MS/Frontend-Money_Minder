import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { RevenueService } from '../../../core/services/revenue.service';
import { ObjectifService } from '../../../core/services/objectif.service';
import { DepenseService } from '../../../core/services/depense.service';
import { CategorieRevenueService } from '../../../core/services/categorie-revenue.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategorieRevenue, Depense, Objectif, Revenue } from '../../../core/models/types';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class ClientDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];
  private viewReady = false;
  private dataReady = false;

  loading = true;
  errorMsg = '';

  revenues: Revenue[] = [];
  depenses: Depense[] = [];
  objectifs: Objectif[] = [];
  categories: CategorieRevenue[] = [];

  totalRevenues = 0;
  totalDepenses = 0;
  solde = 0;
  objectifsActifs = 0;

  recentTx: Array<{ type: 'R' | 'D'; label: string; cat: string; montant: number; date: string }> = [];

  constructor(
    private revenueService: RevenueService,
    private objectifService: ObjectifService,
    private depenseService: DepenseService,
    private categorieService: CategorieRevenueService,
    private auth: AuthService,
  ) {}

  get userId(): number {
    return this.auth.userId ?? 0;
  }

  ngOnInit(): void {
    forkJoin({
      revenues: this.revenueService.getAll(),
      objectifs: this.objectifService.getByUser(this.userId),
      depenses: this.depenseService.getByUser(this.userId),
      categories: this.categorieService.getAll(),
    }).subscribe({
      next: (res) => {
        this.revenues = (res.revenues || []).filter((r) => r.userId === this.userId);
        this.objectifs = res.objectifs || [];
        this.depenses = res.depenses || [];
        this.categories = res.categories || [];
        this.compute();
        this.loading = false;
        this.dataReady = true;
        this.tryRender();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Impossible de charger le tableau de bord. L'API Gateway est-elle démarrée ?";
      },
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRender();
  }

  private compute(): void {
    this.totalRevenues = this.revenues.reduce((s, r) => s + (r.amount || 0), 0);
    this.totalDepenses = this.depenses.reduce((s, d) => s + (d.montant || 0), 0);
    this.solde = this.totalRevenues - this.totalDepenses;
    this.objectifsActifs = this.objectifs.filter((o) => o.statut === 'EN_COURS').length;

    this.recentTx = [
      ...this.revenues.map((r) => ({
        type: 'R' as const, label: r.description || r.source || 'Revenue',
        cat: this.catName(r.categoryId), montant: r.amount || 0, date: r.date || '',
      })),
      ...this.depenses.map((d) => ({
        type: 'D' as const, label: d.description || 'Dépense',
        cat: d.categorie || '', montant: d.montant || 0, date: d.date || '',
      })),
    ]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 6);
  }

  catName(id: number): string {
    return this.categories.find((c) => c.id === id)?.name ?? 'Autre';
  }

  private tryRender(): void {
    if (this.viewReady && this.dataReady && !this.errorMsg) {
      setTimeout(() => { this.buildDoughnut(); this.buildLine(); }, 0);
    }
  }

  private buildDoughnut(): void {
    if (!this.doughnutCanvas) return;
    const byCat = new Map<string, number>();
    this.revenues.forEach((r) => {
      const name = this.catName(r.categoryId);
      byCat.set(name, (byCat.get(name) ?? 0) + (r.amount || 0));
    });
    const labels = byCat.size ? [...byCat.keys()] : ['Aucune donnée'];
    const values = byCat.size ? [...byCat.values()] : [1];

    this.charts.push(new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#3D9B8E', '#1B3A57', '#5FBEAB', '#F59E0B', '#8B5CF6', '#0EA5E9', '#10B981', '#EF4444'],
          borderWidth: 0, hoverOffset: 8,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle' } } },
      },
    }));
  }

  private buildLine(): void {
    if (!this.lineCanvas) return;

    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const revByMonth = months.map((m) =>
      this.revenues.filter((r) => (r.date || '').startsWith(m)).reduce((s, r) => s + (r.amount || 0), 0));
    const depByMonth = months.map((m) =>
      this.depenses.filter((d) => (d.date || '').startsWith(m)).reduce((s, d) => s + (d.montant || 0), 0));
    const labels = months.map((m) => {
      const mm = +m.split('-')[1];
      return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][mm - 1];
    });

    this.charts.push(new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenues', data: revByMonth,
            borderColor: '#3D9B8E', backgroundColor: 'rgba(61,155,142,0.12)',
            fill: true, tension: 0.4, borderWidth: 3, pointBackgroundColor: '#3D9B8E', pointRadius: 4,
          },
          {
            label: 'Dépenses', data: depByMonth,
            borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)',
            fill: true, tension: 0.4, borderWidth: 3, pointBackgroundColor: '#EF4444', pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } } } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F2F5F7' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    }));
  }

  ngOnDestroy(): void {
    this.charts.forEach((c) => c.destroy());
  }
}
