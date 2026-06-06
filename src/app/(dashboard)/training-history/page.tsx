import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { SearchFilter } from "./search-filter";
import { HistoryPagination } from "./pagination";

const ITEMS_PER_PAGE = 10;

export default async function TrainingHistoryPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const year = typeof searchParams.year === "string" && searchParams.year !== "ALL" ? parseInt(searchParams.year) : null;
  const month = typeof searchParams.month === "string" && searchParams.month !== "ALL" ? parseInt(searchParams.month) : null;
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page) || 1) : 1;

  const whereClause: any = {
    training: {
      status: "COMPLETED",
    },
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nik: { contains: search, mode: "insensitive" } },
      { training: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (year !== null) {
    let startDate: Date;
    let endDate: Date;
    if (month !== null) {
      // Month from URL is 1-indexed (1-12)
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }
    
    whereClause.trainingDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  const [historyData, totalCount] = await Promise.all([
    prisma.trainingParticipant.findMany({
      where: whereClause,
      include: { training: true },
      orderBy: { trainingDate: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.trainingParticipant.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-navy">Riwayat Training</h2>
        <SearchFilter />
      </div>

      <Card>
        <CardHeader className="bg-surface border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky/10 rounded-md">
              <History className="w-5 h-5 text-sky" />
            </div>
            <div>
              <CardTitle className="text-xl">Data Riwayat Training Karyawan</CardTitle>
              <CardDescription>
                Daftar histori training yang telah diselesaikan (Completed) oleh karyawan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-background">
              <TableRow>
                <TableHead>NIK</TableHead>
                <TableHead>Nama Karyawan</TableHead>
                <TableHead>Nama Training</TableHead>
                <TableHead>Job Family</TableHead>
                <TableHead>Tgl. Mulai</TableHead>
                <TableHead>Tgl. Selesai</TableHead>
                <TableHead className="text-center">Jam Belajar</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Belum ada riwayat training yang berstatus Completed.
                  </TableCell>
                </TableRow>
              ) : (
                historyData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.nik}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={item.training.name}>
                      {item.training.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.training.jobFamilies.map((jf, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] py-0 h-5">
                            {jf}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(item.training.startDate)}</TableCell>
                    <TableCell>{formatDate(item.training.endDate)}</TableCell>
                    <TableCell className="text-center font-semibold text-navy">
                      {item.attendedHours} Jam
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-success text-white hover:bg-success/90">
                        Selesai
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalCount > 0 && (
        <HistoryPagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
          searchParams={searchParams as Record<string, string>}
        />
      )}
    </div>
  );
}
