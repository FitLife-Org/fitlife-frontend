import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ChartDataDto } from '../../../types/dashboard.type';

interface D3PieChartProps {
    data: ChartDataDto[];
    height?: number;
    colors?: string[];
    donut?: boolean;
}

export default function D3PieChart({
                                       data,
                                       height = 300,
                                       colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b'],
                                       donut = true
                                   }: D3PieChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    // Lấy kích thước thực tế của vùng chứa
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                setWidth(entries[0].contentRect.width);
            }
        });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !data || data.length === 0 || width === 0) return;

        // 1. Xóa SVG cũ
        d3.select(svgRef.current).selectAll('*').remove();

        // 2. Dọn dẹp "bóng ma" Tooltip cũ (Rất quan trọng để không bị chặn chuột)
        d3.select(containerRef.current).selectAll('.pie-tooltip').remove();

        const radius = (Math.min(width, height) / 2) - 15;
        const innerRadius = donut ? radius * 0.65 : 0;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2}, ${(height / 2) - 10})`);

        const colorScale = d3.scaleOrdinal<string>()
            .domain(data.map(d => d.label))
            .range(colors);

        const pie = d3.pie<ChartDataDto>()
            .value(d => Number(d.value))
            .sort(null);

        const arc = d3.arc<d3.PieArcDatum<ChartDataDto>>()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        const arcHover = d3.arc<d3.PieArcDatum<ChartDataDto>>()
            .innerRadius(innerRadius)
            .outerRadius(radius + 8);

        // Khởi tạo Tooltip
        const tooltip = d3.select(containerRef.current)
            .append('div')
            .attr('class', 'pie-tooltip') // Đánh dấu class để dễ xóa
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'rgba(255, 255, 255, 0.95)')
            .style('backdrop-filter', 'blur(12px)')
            .style('border', '1px solid rgba(226, 232, 240, 0.8)')
            .style('border-radius', '12px')
            .style('padding', '10px 16px')
            .style('box-shadow', '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)')
            .style('pointer-events', 'none')
            .style('z-index', '999')
            .style('opacity', '0')
            .style('transform', 'translate(-50%, -100%)')
            .style('transition', 'opacity 0.15s ease');

        const total = d3.sum(data, d => Number(d.value));

        // Vẽ các khối Pie
        const slices = g.selectAll('path.pie-slice')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('class', 'pie-slice')
            .attr('fill', d => colorScale(d.data.label))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', '3px')
            .style('cursor', 'pointer'); // Trỏ chuột biến thành bàn tay

        // BẮT SỰ KIỆN CHUỘT (Đã fix lỗi cứng đơ)
        slices.on('mouseover', (event, d) => {
            const currentSlice = event.currentTarget as SVGPathElement;

            // Làm mờ toàn bộ khối khác (Có dùng interrupt để tránh xung đột animation)
            g.selectAll('.pie-slice')
                .interrupt()
                .transition().duration(200)
                .style('opacity', 0.35);

            // Phóng to & giữ sáng khối được chỉ vào
            d3.select(currentSlice)
                .interrupt()
                .transition().duration(250).ease(d3.easeCubicOut)
                .style('opacity', 1)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('d', arcHover as any);

            // Đảm bảo không bị NaN nếu biểu đồ không có dữ liệu (total = 0)
            const percent = total > 0 ? ((Number(d.data.value) / total) * 100).toFixed(1) : "0.0";

            tooltip.interrupt()
                .style('visibility', 'visible')
                .style('opacity', '1')
                .html(`
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                            ${d.data.label}
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${colorScale(d.data.label)}; display: inline-block;"></span>
                            <strong style="color: #0f172a; font-size: 16px; font-weight: 800;">
                                ${d.data.value} <span style="color: #94a3b8; font-size: 13px; font-weight: 600;">(${percent}%)</span>
                            </strong>
                        </div>
                    </div>
                `);
        });

        slices.on('mousemove', (event) => {
            const [xPos, yPos] = d3.pointer(event, containerRef.current);
            tooltip
                .style('top', (yPos - 15) + 'px')
                .style('left', xPos + 'px');
        });

        slices.on('mouseout', (event) => {
            // Phục hồi lại toàn bộ khối (interrupt để phản hồi ngay lập tức khi rút chuột ra)
            g.selectAll('.pie-slice')
                .interrupt()
                .transition().duration(250).ease(d3.easeCubicOut)
                .style('opacity', 1)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('d', arc as any);

            tooltip.interrupt()
                .transition().duration(150)
                .style('opacity', '0')
                .on('end', function() {
                    d3.select(this).style('visibility', 'hidden');
                });
        });

        // Hoạt ảnh (Animation) khi load
        slices.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .attrTween('d', function(d) {
                const i = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                return function(t) {
                    return arc(i(t)) as string;
                };
            });

        // Dọn dẹp component khi bị hủy
        return () => {
            d3.select(containerRef.current).selectAll('.pie-tooltip').remove();
        };
    }, [data, width, height, colors, donut]);

    return (
        <div ref={containerRef} className="w-full relative flex flex-col items-center justify-center h-full">
            <svg ref={svgRef} className="overflow-visible"></svg>

            <div className="w-full flex flex-wrap justify-center gap-5 mt-4 pb-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 font-semibold cursor-default hover:text-slate-900 transition-colors">
                        <span
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                        />
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}