import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Loader2, MoreHorizontal, Pencil, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "../ui/badge";
import DeleteModal from "../DeleteModal";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { AddTeacher } from "../AddTeacher";
import { Skeleton } from "../ui/skeleton";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Label } from "../ui/label";
import MultiSelectDropdown from "../MultiSelectDropdown";

export type Teacher = {
  teacher_id: string;
  lastname: string;
  firstname: string;
  courses: Array<string>;
  sections: Array<string>;
  subjects: Array<string>;
  teacher_email: string;
  password: string;

};

const FormSchema = z.object({
  teacher_id: z.string().min(10, { message: "ID must have at least 10 characters" }),
  teacher_email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
  lastname: z.string().min(1, { message: "Last Name is required" }),
  firstname: z.string().min(1, { message: "First Name is required" }),
  courses: z.array(z.string()).min(1, { message: 'At least one course is required' }),
  sections: z.array(z.string()).min(1, { message: 'At least one section is required' }),
  subjects: z.array(z.string()).min(1, { message: 'At least one subject is required' }),
});

type FormData = z.infer<typeof FormSchema>;


export const columns = (setOpenQRModal: (open: boolean) => void, setId: (id: string) => void, handleEdit: (teacher: Teacher) => void): ColumnDef<Teacher>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "teacher_id",
    header: "ID",
    cell: ({ row }) => <div className="capitalize">{row.getValue("teacher_id")}</div>,
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Last Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("lastname")}</div>,
  },
  {
    accessorKey: "firstname",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            First Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("firstname")}</div>,
  },
  {
    accessorKey: "teacher_email",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => <div>{row.getValue("teacher_email")}</div>,
  },
  {
    accessorKey: "subjects",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Subjects
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const subjects = row.getValue("subjects") as string[]; // Explicitly type as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {subjects.map((subject, index) => (
            <Badge key={index} variant="secondary">
              {subject}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "courses",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Courses
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const courses = row.getValue("courses") as string[]; // Explicitly type as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {courses.map((course, index) => (
            <Badge key={index} variant="secondary">
              {course}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "sections",
    header: ({ column }) => {
      return (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs pl-0 bg-transparent"
          >
            Sections
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const sections = row.getValue("sections") as string[]; // Explicitly type as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {sections.map((section, index) => (
            <Badge key={index} variant="secondary">
              {section}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const teacher = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(teacher.teacher_id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              setId(row.original.teacher_id);
              setOpenQRModal(true);
            }}>
              <QrCode className="mr-2 h-4 w-4" />
              View QR Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(teacher)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
          
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function FacultyTable() {
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "lastname", desc: false}]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [openQRModal, setOpenQRModal] = React.useState(false);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [id, setId] = React.useState<string>('')
  const [loadingTable, setLoadingTable] = React.useState(true);
  const [teacherData, setTeacherData] = React.useState<Teacher | null>(null);
  const [openEditModal, setOpenEditModal] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      teacher_id: teacherData?.teacher_id || "",
      teacher_email: teacherData?.teacher_email || "",
      lastname: teacherData?.lastname || "",
      firstname: teacherData?.firstname || "",
      courses: teacherData?.courses || [],
      sections: teacherData?.sections || [],
      subjects: teacherData?.subjects || [],
    },
  });



  const fetchTeachers = async () => {
    try {
      const response = await axios.get("https://comlab-backend.vercel.app/api/teacher/getTeachers");
      setTeachers(response.data);
      console.log(response.data);
      setLoadingTable(false);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const deleteUser = async () => {
    setLoading(true);
    try {
      const selectedRows = table.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const teacher_id = row.original.teacher_id; // Access the user's _id
        await axios.delete(`https://comlab-backend.vercel.app/api/teacher/deleteTeacher/${teacher_id}`);
        console.log(`Deleted user with ID: ${teacher_id}`);
      }
      toast.info(`${selectedRows.length} Teacher/s has been deleted.`);

      fetchTeachers();
      setRowSelection({});
      setLoading(false);
      setOpenDelete(false);
    } catch (error) {
      console.error("Error deleting a user", error);
      setOpenDelete(false);
      toast.error("Unknown error has occured");
    }
  };

  React.useEffect(() => {
    fetchTeachers();
  }, []);

  
  const handleEdit = (teacher: Teacher) => {
    setTeacherData(teacher);
    setOpenEditModal(true)
    reset({
      teacher_id: teacher.teacher_id,
      teacher_email: teacher.teacher_email,
      lastname: teacher.lastname,
      firstname: teacher.firstname,
      courses: teacher.courses,
      sections: teacher.sections,
      subjects: teacher.subjects,
    });
    console.log(teacher)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const newData = {teacher_id: data.teacher_id, teacher_email: data.teacher_email, lastname: data.lastname, firstname: data.firstname, courses: data.courses, sections: data.sections, subjects: data.subjects}
    try {
      const response = await axios.post("https://comlab-backend.vercel.app/api/teacher/editTeacher", newData)
      if (response.status === 200) {
        toast.success("Teacher updated successfully");
        fetchTeachers(); // Refresh the student list
        setOpenEditModal(false);
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }

  }

  const table = useReactTable({
    data: teachers,
    columns: columns(setOpenQRModal, setId, handleEdit),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Generate unique values for course and section
  // const uniqueCourses = Array.from(new Set(teachers.map((teacher) => teacher.courses)));
  // const uniqueSections = Array.from(new Set(teachers.map((teacher) => teacher.sections)));

  return (
    <>
      {loadingTable ? (
        <div className="w-full">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min relative ">
            <div className="flex items-center py-4 font-geist justify-between">
              <div className="w-1/2 flex gap-2">
                <Skeleton className="w-[30%] h-10"/>
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-20 h-10"/>
              </div>
            </div>
            <div className="rounded-md border font-geist">
              <Skeleton className="h-96 w-full"></Skeleton>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4 font-geist">
              <Skeleton className="h-10 w-20"></Skeleton>
              <div className="space-x-2 flex">
              <Skeleton className="w-20 h-8"/>
              <Skeleton className="w-20 h-8"/>
              </div>
            </div>
          </div>
        </div>
      ):(
        <div className="w-full">
          <div className="flex items-center justify-between py-4">
            <div className="flex justify-between">
              <Input
                placeholder="Filter by name..."
                value={(table.getColumn("lastname")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("lastname")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              {Object.keys(rowSelection).length !== 0 && (
                <DeleteModal
                  title={`Delete (${Object.keys(rowSelection).length})`}
                  description={`Are you sure you want to delete ${Object.keys(rowSelection).length} teacher(s)?`}
                  open={openDelete}
                  setOpen={setOpenDelete}
                  onClick={deleteUser}
                  loading={loading}
                />
              )}
              <AddTeacher open={open} setOpen={setOpen} fetch={fetchTeachers} />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
          <Dialog open={openQRModal} onOpenChange={setOpenQRModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>QR Code</DialogTitle>
                <DialogDescription>
                  This is the QR code for the selected student.
                </DialogDescription>
                <div className="w-full flex items-center justify-center">
                  <div className="w-fit">
                    <QRCodeSVG value={id.toString()} size={300} />
                  </div>
                </div>
              </DialogHeader>
              {/* Add QR Code rendering logic here */}
            </DialogContent>
          </Dialog>
          <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
            <DialogContent className="sm:max-w-[425px] font-geist">
              <DialogHeader>
                <DialogTitle>Edit Teacher</DialogTitle>
                <DialogDescription>Click submit when you're done.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  {/* Teacher ID */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="teacher_id" className="text-right">ID</Label>
                    <div className="col-span-3 relative">
                      <Input id="teacher_id" {...register('teacher_id')} placeholder="########" />
                      {errors.teacher_id && <span className="text-red-500 text-xs font-geist">{errors.teacher_id.message}</span>}
                    </div>
                  </div>

                  {/* Teacher Email */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="teacher_email" className="text-right">Email</Label>
                    <div className="col-span-3 relative">
                      <Input id="teacher_email" {...register('teacher_email')} placeholder="Email" />
                      {errors.teacher_email && <span className="text-red-500 text-xs font-geist">{errors.teacher_email.message}</span>}
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lastname" className="text-right">Last Name</Label>
                    <div className="col-span-3 relative">
                      <Input id="lastname" {...register('lastname')} placeholder="Last Name" />
                      {errors.lastname && <span className="text-red-500 text-xs font-geist">{errors.lastname.message}</span>}
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstname" className="text-right">First Name</Label>
                    <div className="col-span-3 relative">
                      <Input id="firstname" {...register('firstname')} placeholder="First Name" />
                      {errors.firstname && <span className="text-red-500 text-xs font-geist">{errors.firstname.message}</span>}
                    </div>
                  </div>

                  {/* Subjects - Using Controller for complex inputs */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subjects" className="text-right">Subjects</Label>
                    <div className="col-span-3 relative">
                      <Controller
                        name="subjects"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectDropdown
                            options={['Programming', 'Database Management', 'Web Development']}
                            onChange={field.onChange}
                            defaultValue={field.value}
                          />
                        )}
                      />
                      {errors.subjects && <p className="text-red-500 text-xs">{errors.subjects.message}</p>}
                    </div>
                  </div>

                  {/* Courses - Using Controller for complex inputs */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="courses" className="text-right">Courses</Label>
                    <div className="col-span-3 relative">
                      <Controller
                        name="courses"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectDropdown
                            options={['BSIS', 'BSAIS', 'BSOM']}
                            onChange={field.onChange}
                            defaultValue={field.value}
                          />
                        )}
                      />
                      {errors.courses && <p className="text-red-500 text-xs">{errors.courses.message}</p>}
                    </div>
                  </div>

                  {/* Sections - Using Controller for complex inputs */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sections" className="text-right">Sections</Label>
                    <div className="col-span-3 relative">
                      <Controller
                        name="sections"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectDropdown
                            options={['4A', '4B', '4C', '4D']}
                            onChange={field.onChange}
                            defaultValue={field.value}
                          />
                        )}
                      />
                      {errors.sections && <p className="text-red-500 text-xs">{errors.sections.message}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex items-center">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        Updating
                        <Loader2 className="animate-spin ml-2" />
                      </>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}