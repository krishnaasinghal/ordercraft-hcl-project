package com.ordercraft.config;

import com.ordercraft.entity.*;
import com.ordercraft.enums.*;
import com.ordercraft.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final BillOfMaterialRepository bomRepository;
    private final ManufacturingOrderRepository orderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CustomerRepository customerRepository,
                           SupplierRepository supplierRepository,
                           ProductRepository productRepository,
                           RawMaterialRepository rawMaterialRepository,
                           BillOfMaterialRepository bomRepository,
                           ManufacturingOrderRepository orderRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           InvoiceRepository invoiceRepository,
                           PaymentRepository paymentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.bomRepository = bomRepository;
        this.orderRepository = orderRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        // 1. Seed Admin User
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("System Administrator");
        admin.setRole("ADMIN");
        userRepository.save(admin);

        // 2. Seed Customers
        Customer c1 = createCustomer("Apex Robotics Ltd", "procurement@apexrobotics.in", "+91 98765 43210",
                "Plot 42, Electronic City Phase 1", "Bengaluru", "Karnataka", "560100", "India", "29AABCA1234F1Z5");
        Customer c2 = createCustomer("Bharat Automation Corp", "orders@bharatauto.com", "+91 91234 56789",
                "Sector 18, Udyog Vihar", "Gurugram", "Haryana", "122015", "India", "06AABCB5678G2Z6");
        Customer c3 = createCustomer("Zenith Renewable Systems", "supply@zenithsolar.co.in", "+91 98220 11223",
                "MIDC Bhosari Industrial Area", "Pune", "Maharashtra", "411026", "India", "27AABCZ9988H3Z7");
        customerRepository.saveAll(List.of(c1, c2, c3));

        // 3. Seed Suppliers
        Supplier s1 = createSupplier("Tata Steel Tubes & Sheets", "Sunil Sharma", "sales@tatasteel-tubes.com", "+91 98300 12345",
                "Jamshedpur Works, Tata Complex", "Jamshedpur", "Jharkhand", "831001", "India", "20AAACT2727Q1ZW");
        Supplier s2 = createSupplier("Microchip Silicon Devices", "Priya Nair", "orders@microchipsilicon.in", "+91 98450 67890",
                "Export Promotion Zone, Whitefield", "Bengaluru", "Karnataka", "560066", "India", "29AABCM4433P1ZY");
        Supplier s3 = createSupplier("Allied Fasteners & Hardware", "Rajesh Patel", "info@alliedfasteners.com", "+91 97240 55443",
                "GIDC Industrial Estate, Makarpura", "Vadodara", "Gujarat", "390010", "India", "24AABCA8899K1ZX");
        supplierRepository.saveAll(List.of(s1, s2, s3));

        // 4. Seed Raw Materials
        RawMaterial rm1 = createRawMaterial("RM-STL-001", "CRCA Sheet Steel 2.0mm", "Cold Rolled Close Annealed Steel Sheets",
                new BigDecimal("85.50"), new BigDecimal("450.00"), new BigDecimal("100.00"), "KG", s1);
        RawMaterial rm2 = createRawMaterial("RM-MCU-032", "ARM Cortex-M4 Microcontroller", "32-bit MCU 120MHz LQFP-64 IC",
                new BigDecimal("420.00"), new BigDecimal("18.00"), new BigDecimal("50.00"), "PCS", s2); // Low stock!
        RawMaterial rm3 = createRawMaterial("RM-ALU-005", "Extruded Aluminum Enclosure IP67", "CNC Milled Anodized Black Casing",
                new BigDecimal("650.00"), new BigDecimal("85.00"), new BigDecimal("30.00"), "PCS", s1);
        RawMaterial rm4 = createRawMaterial("RM-FST-008", "M8 Hex Socket Screws SS304", "Stainless Steel Grade A2 Socket Screws",
                new BigDecimal("4.50"), new BigDecimal("2500.00"), new BigDecimal("500.00"), "PCS", s3);
        RawMaterial rm5 = createRawMaterial("RM-COP-012", "Enameled Copper Winding Wire 18AWG", "High thermal resistance copper magnet wire",
                new BigDecimal("720.00"), new BigDecimal("22.50"), new BigDecimal("35.00"), "KG", s2); // Low stock!
        rawMaterialRepository.saveAll(List.of(rm1, rm2, rm3, rm4, rm5));

        // 5. Seed Products
        Product p1 = createProduct("PRD-IOT-100", "Smart Industrial IoT Gateway Pro",
                "Ruggedized IoT Gateway with Modbus RTU, MQTT, 4G LTE, and DIN rail mounting",
                new BigDecimal("8500.00"), "Electronics", "PCS");
        Product p2 = createProduct("PRD-ACT-200", "High-Torque Heavy Duty Actuator",
                "Brushless DC Servo Actuator 24V with planetary gearhead and optical encoder",
                new BigDecimal("14200.00"), "Mechanical", "PCS");
        Product p3 = createProduct("PRD-INV-500", "Solar Hybrid Grid Inverter 5kW",
                "Pure sine wave hybrid bi-directional inverter with MPPT charger",
                new BigDecimal("38000.00"), "Electronics", "PCS");
        productRepository.saveAll(List.of(p1, p2, p3));

        // 6. Seed Bills of Materials (BOM)
        BillOfMaterial bom1 = new BillOfMaterial();
        bom1.setProduct(p1);
        bom1.setVersion("V2.1");
        bom1.setStatus(BomStatus.ACTIVE);
        bom1.setEffectiveDate(LocalDate.now().minusMonths(2));
        bom1.setNotes("Production Release V2.1 with improved thermal casing");

        BomItem bi1 = createBomItem(bom1, rm1, new BigDecimal("1.50"), "KG", new BigDecimal("3.00"));
        BomItem bi2 = createBomItem(bom1, rm2, new BigDecimal("1.00"), "PCS", new BigDecimal("1.00"));
        BomItem bi3 = createBomItem(bom1, rm3, new BigDecimal("1.00"), "PCS", new BigDecimal("0.00"));
        BomItem bi4 = createBomItem(bom1, rm4, new BigDecimal("8.00"), "PCS", new BigDecimal("5.00"));
        bom1.setItems(List.of(bi1, bi2, bi3, bi4));
        bomRepository.save(bom1);

        BillOfMaterial bom2 = new BillOfMaterial();
        bom2.setProduct(p2);
        bom2.setVersion("V1.0");
        bom2.setStatus(BomStatus.ACTIVE);
        bom2.setEffectiveDate(LocalDate.now().minusMonths(1));
        bom2.setNotes("Standard heavy-duty actuator assembly BOM");

        BomItem bi5 = createBomItem(bom2, rm1, new BigDecimal("3.20"), "KG", new BigDecimal("4.00"));
        BomItem bi6 = createBomItem(bom2, rm5, new BigDecimal("2.50"), "KG", new BigDecimal("2.00"));
        BomItem bi7 = createBomItem(bom2, rm4, new BigDecimal("16.00"), "PCS", new BigDecimal("5.00"));
        bom2.setItems(List.of(bi5, bi6, bi7));
        bomRepository.save(bom2);

        // 7. Seed Sample Manufacturing Orders
        // Order 1: Completed & Invoiced
        ManufacturingOrder mo1 = new ManufacturingOrder();
        mo1.setOrderNumber("MO-2024-00001");
        mo1.setCustomer(c1);
        mo1.setStatus(OrderStatus.COMPLETED);
        mo1.setPriority(Priority.HIGH);
        mo1.setOrderDate(LocalDate.now().minusDays(25));
        mo1.setDueDate(LocalDate.now().minusDays(5));
        mo1.setCompletionDate(LocalDate.now().minusDays(6));
        mo1.setNotes("Urgent batch for automated assembly cell line 3");

        OrderItem oi1 = new OrderItem();
        oi1.setManufacturingOrder(mo1);
        oi1.setProduct(p1);
        oi1.setQuantity(10);
        oi1.setUnitPrice(p1.getUnitPrice());
        oi1.setLineTotal(p1.getUnitPrice().multiply(BigDecimal.valueOf(10)));
        mo1.setItems(List.of(oi1));
        mo1.setTotalAmount(oi1.getLineTotal());
        orderRepository.save(mo1);

        // Generate Invoice for Order 1
        BigDecimal subtotal1 = mo1.getTotalAmount();
        BigDecimal taxRate = new BigDecimal("18.00");
        BigDecimal tax1 = subtotal1.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal total1 = subtotal1.add(tax1);

        Invoice inv1 = new Invoice();
        inv1.setInvoiceNumber("INV-2024-00001");
        inv1.setManufacturingOrder(mo1);
        inv1.setCustomer(c1);
        inv1.setStatus(InvoiceStatus.PAID);
        inv1.setIssueDate(LocalDate.now().minusDays(5));
        inv1.setDueDate(LocalDate.now().plusDays(25));
        inv1.setSubtotal(subtotal1);
        inv1.setTaxRate(taxRate);
        inv1.setTaxAmount(tax1);
        inv1.setTotalAmount(total1);
        inv1.setNotes("Payment terms Net 30 - Paid in full");
        invoiceRepository.save(inv1);

        Payment pay1 = new Payment();
        pay1.setInvoice(inv1);
        pay1.setPaymentDate(LocalDate.now().minusDays(2));
        pay1.setAmount(total1);
        pay1.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        pay1.setReferenceNumber("UTR-HDFC-99281726");
        pay1.setStatus(PaymentStatus.COMPLETED);
        pay1.setNotes("Full invoice settlement via NEFT");
        paymentRepository.save(pay1);

        // Order 2: In Production
        ManufacturingOrder mo2 = new ManufacturingOrder();
        mo2.setOrderNumber("MO-2024-00002");
        mo2.setCustomer(c2);
        mo2.setStatus(OrderStatus.IN_PRODUCTION);
        mo2.setPriority(Priority.URGENT);
        mo2.setOrderDate(LocalDate.now().minusDays(10));
        mo2.setDueDate(LocalDate.now().plusDays(4));
        mo2.setNotes("Tier-1 supply commitment for conveyor plant");

        OrderItem oi2 = new OrderItem();
        oi2.setManufacturingOrder(mo2);
        oi2.setProduct(p2);
        oi2.setQuantity(5);
        oi2.setUnitPrice(p2.getUnitPrice());
        oi2.setLineTotal(p2.getUnitPrice().multiply(BigDecimal.valueOf(5)));
        mo2.setItems(List.of(oi2));
        mo2.setTotalAmount(oi2.getLineTotal());
        orderRepository.save(mo2);

        // Order 3: Confirmed (Ready for BOM Explosion & PO Generation)
        ManufacturingOrder mo3 = new ManufacturingOrder();
        mo3.setOrderNumber("MO-2024-00003");
        mo3.setCustomer(c3);
        mo3.setStatus(OrderStatus.CONFIRMED);
        mo3.setPriority(Priority.MEDIUM);
        mo3.setOrderDate(LocalDate.now().minusDays(2));
        mo3.setDueDate(LocalDate.now().plusDays(15));
        mo3.setNotes("Initial pilot lot for rooftop solar project");

        OrderItem oi3 = new OrderItem();
        oi3.setManufacturingOrder(mo3);
        oi3.setProduct(p1);
        oi3.setQuantity(20);
        oi3.setUnitPrice(p1.getUnitPrice());
        oi3.setLineTotal(p1.getUnitPrice().multiply(BigDecimal.valueOf(20)));
        mo3.setItems(List.of(oi3));
        mo3.setTotalAmount(oi3.getLineTotal());
        orderRepository.save(mo3);

        // 8. Seed Sample Purchase Order
        PurchaseOrder po1 = new PurchaseOrder();
        po1.setPoNumber("PO-2024-00001");
        po1.setSupplier(s2);
        po1.setManufacturingOrder(mo3);
        po1.setStatus(PurchaseOrderStatus.SENT);
        po1.setOrderDate(LocalDate.now().minusDays(1));
        po1.setExpectedDeliveryDate(LocalDate.now().plusDays(6));
        po1.setNotes("Procurement for MO-2024-00003 shortage");

        PurchaseOrderItem poi1 = new PurchaseOrderItem();
        poi1.setPurchaseOrder(po1);
        poi1.setRawMaterial(rm2);
        poi1.setQuantity(new BigDecimal("50.00"));
        poi1.setUnitCost(rm2.getUnitCost());
        poi1.setLineTotal(rm2.getUnitCost().multiply(new BigDecimal("50.00")));
        po1.setItems(List.of(poi1));
        po1.setTotalAmount(poi1.getLineTotal());
        purchaseOrderRepository.save(po1);
    }

    private Customer createCustomer(String name, String email, String phone, String address,
                                    String city, String state, String zip, String country, String gst) {
        Customer c = new Customer();
        c.setName(name);
        c.setEmail(email);
        c.setPhone(phone);
        c.setAddress(address);
        c.setCity(city);
        c.setState(state);
        c.setZipCode(zip);
        c.setCountry(country);
        c.setGstNumber(gst);
        return c;
    }

    private Supplier createSupplier(String name, String contact, String email, String phone,
                                    String address, String city, String state, String zip, String country, String gst) {
        Supplier s = new Supplier();
        s.setName(name);
        s.setContactPerson(contact);
        s.setEmail(email);
        s.setPhone(phone);
        s.setAddress(address);
        s.setCity(city);
        s.setState(state);
        s.setZipCode(zip);
        s.setCountry(country);
        s.setGstNumber(gst);
        return s;
    }

    private RawMaterial createRawMaterial(String sku, String name, String desc, BigDecimal cost,
                                          BigDecimal stock, BigDecimal reorder, String uom, Supplier s) {
        RawMaterial rm = new RawMaterial();
        rm.setSku(sku);
        rm.setName(name);
        rm.setDescription(desc);
        rm.setUnitCost(cost);
        rm.setStockQuantity(stock);
        rm.setReorderLevel(reorder);
        rm.setUnitOfMeasure(uom);
        rm.setSupplier(s);
        return rm;
    }

    private Product createProduct(String sku, String name, String desc, BigDecimal price, String cat, String uom) {
        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setDescription(desc);
        p.setUnitPrice(price);
        p.setCategory(cat);
        p.setUnitOfMeasure(uom);
        return p;
    }

    private BomItem createBomItem(BillOfMaterial bom, RawMaterial rm, BigDecimal qty, String uom, BigDecimal scrap) {
        BomItem bi = new BomItem();
        bi.setBillOfMaterial(bom);
        bi.setRawMaterial(rm);
        bi.setQuantityRequired(qty);
        bi.setUnitOfMeasure(uom);
        bi.setScrapFactor(scrap);
        return bi;
    }
}
